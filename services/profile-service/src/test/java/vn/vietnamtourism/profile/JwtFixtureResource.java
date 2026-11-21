package vn.vietnamtourism.profile;

import io.quarkus.test.common.QuarkusTestResourceLifecycleManager;
import com.sun.net.httpserver.HttpServer;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.InetSocketAddress;
import java.security.*;
import java.security.interfaces.ECPublicKey;
import java.security.spec.ECGenParameterSpec;
import java.math.BigInteger;
import java.time.Instant;
import java.util.*;
import org.jose4j.jws.JsonWebSignature;

public class JwtFixtureResource implements QuarkusTestResourceLifecycleManager {
    public static final String ISSUER="https://fixture.supabase.test/auth/v1";
    private static KeyPair pair;
    private HttpServer server;
    private static final ObjectMapper JSON=new ObjectMapper();
    @Override public Map<String,String> start() {
        try {
            var generator=KeyPairGenerator.getInstance("EC");
            generator.initialize(new ECGenParameterSpec("secp256r1")); pair=generator.generateKeyPair();
            var key=(ECPublicKey)pair.getPublic();
            var jwk=Map.of("kty","EC","crv","P-256","kid","fixture-v1","alg","ES256","use","sig",
                "x",coordinate(key.getW().getAffineX()),"y",coordinate(key.getW().getAffineY()));
            byte[] body=JSON.writeValueAsBytes(Map.of("keys",List.of(jwk)));
            server=HttpServer.create(new InetSocketAddress("127.0.0.1",0),0);
            server.createContext("/jwks",exchange->{exchange.getResponseHeaders().add("Content-Type","application/json");exchange.sendResponseHeaders(200,body.length);exchange.getResponseBody().write(body);exchange.close();});
            server.start();
            return Map.of("mp.jwt.verify.issuer",ISSUER,"mp.jwt.verify.publickey.location","http://127.0.0.1:"+server.getAddress().getPort()+"/jwks","mp.jwt.verify.publickey.algorithm","ES256");
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private static String coordinate(BigInteger n) {
        byte[] bytes=n.toByteArray(), padded=new byte[32];
        System.arraycopy(bytes,Math.max(0,bytes.length-32),padded,Math.max(0,32-bytes.length),Math.min(32,bytes.length));
        return Base64.getUrlEncoder().withoutPadding().encodeToString(padded);
    }
    @Override public void stop() { if(server!=null)server.stop(0); }
    public static String token(String subject) { return token(subject,Map.of(),false); }
    public static String token(String subject,Map<String,Object> overrides,boolean badSignature) {
        try {
            Map<String,Object> claims=new LinkedHashMap<>(Map.of("iss",ISSUER,"sub",subject,"aud","authenticated","role","authenticated","iat",Instant.now().getEpochSecond(),"exp",Instant.now().plusSeconds(600).getEpochSecond()));
            claims.putAll(overrides);
            var signature=new JsonWebSignature();
            signature.setAlgorithmHeaderValue("ES256"); signature.setKeyIdHeaderValue("fixture-v1");
            if (badSignature) {
                var generator=KeyPairGenerator.getInstance("EC"); generator.initialize(new ECGenParameterSpec("secp256r1"));
                signature.setKey(generator.generateKeyPair().getPrivate());
            } else signature.setKey(pair.getPrivate());
            signature.setPayload(JSON.writeValueAsString(claims));
            return signature.getCompactSerialization();
        } catch(Exception e) { throw new IllegalStateException(e); }
    }
}

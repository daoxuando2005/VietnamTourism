package vn.vietnamtourism.profile.repository.persistence;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "profile_public")
public class PublicProfileEntity {
    @Id public UUID id;
    @Column(nullable = false, unique = true, length = 40) public String username;
    @Column(name = "display_name", nullable = false, length = 100) public String displayName;
    @Column(length = 1000) public String bio;
    @Column(name = "avatar_url", length = 2048) public String avatarUrl;
    @Column(name = "cover_url", length = 2048) public String coverUrl;
    @Column(length = 2048) public String website;
    @Column(length = 200) public String location;
    @Column(name = "account_status", nullable = false, length = 20) public String accountStatus;
    @Column(name = "created_at", nullable = false) public Instant createdAt;
}

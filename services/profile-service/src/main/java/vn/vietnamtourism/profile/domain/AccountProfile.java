package vn.vietnamtourism.profile.domain;

import java.time.LocalDate;

public record AccountProfile(PublicProfile profile,String status,String role,LocalDate birthDate,String phoneNumber) {}

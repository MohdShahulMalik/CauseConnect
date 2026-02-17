package com.merzah.causeconnect.user;

import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class UserUpdateRequest {

    private String email;
    private String name;
    private String bio;
}

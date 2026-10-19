package com.hackmate.dto;

import com.hackmate.entity.User;

/** Small {id, name} reference to a user (team leader, request user). */
public record UserSummaryDto(Long id, String name) {

    public static UserSummaryDto from(User user) {
        return new UserSummaryDto(user.getId(), user.getName());
    }
}

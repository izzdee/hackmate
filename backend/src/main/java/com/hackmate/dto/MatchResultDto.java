package com.hackmate.dto;

/** One ranked candidate: {user, score, breakdown}. score = sum of the breakdown parts (0-100). */
public record MatchResultDto(UserDto user, double score, Breakdown breakdown) {

    /** Points per criterion: skill /50, role /25, experience /15, availability /10. */
    public record Breakdown(double skill, double role, double experience, double availability) {
    }
}

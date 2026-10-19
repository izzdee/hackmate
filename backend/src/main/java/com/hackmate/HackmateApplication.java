package com.hackmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.Map;
import java.util.TimeZone;

@SpringBootApplication
public class HackmateApplication {

    /**
     * On Windows, Java reports some time zones by old alias names (e.g. India → "Asia/Calcutta").
     * The PostgreSQL driver sends this name when connecting, and newer PostgreSQL images reject
     * the old aliases ("invalid value for parameter TimeZone"). We switch to the current name.
     */
    private static final Map<String, String> LEGACY_TIME_ZONES = Map.of(
            "Asia/Calcutta", "Asia/Kolkata",
            "Asia/Katmandu", "Asia/Kathmandu",
            "Asia/Rangoon", "Asia/Yangon",
            "Asia/Saigon", "Asia/Ho_Chi_Minh"
    );

    public static void main(String[] args) {
        useCurrentTimeZoneName();
        SpringApplication.run(HackmateApplication.class, args);
    }

    private static void useCurrentTimeZoneName() {
        String current = TimeZone.getDefault().getID();
        String replacement = LEGACY_TIME_ZONES.get(current);
        if (replacement != null) {
            TimeZone.setDefault(TimeZone.getTimeZone(replacement));
        }
    }
}

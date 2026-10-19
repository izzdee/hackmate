package com.hackmate.repository;

import com.hackmate.entity.Hackathon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HackathonRepository extends JpaRepository<Hackathon, Long> {

    List<Hackathon> findAllByOrderByStartDateAsc();
}

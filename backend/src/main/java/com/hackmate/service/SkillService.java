package com.hackmate.service;

import com.hackmate.dto.SkillDto;
import com.hackmate.entity.Skill;
import com.hackmate.exception.BadRequestException;
import com.hackmate.repository.SkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class SkillService {

    private final SkillRepository skillRepository;

    public SkillService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public List<SkillDto> getAllSkills() {
        return skillRepository.findAllByOrderByNameAsc().stream().map(SkillDto::from).toList();
    }

    /** Loads skills by id; 400 if any id does not exist. Null means "no skills". */
    public Set<Skill> findSkillsByIds(Collection<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<Long> uniqueIds = new HashSet<>(skillIds);
        List<Skill> skills = skillRepository.findAllById(uniqueIds);
        if (skills.size() != uniqueIds.size()) {
            throw new BadRequestException("One or more skill ids are invalid");
        }
        return new HashSet<>(skills);
    }
}

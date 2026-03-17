"use client";

import { useState, useEffect, useCallback } from "react";
import { collegeService } from "@/services/collegeService";
import { departmentService } from "@/services/departmentService";
import { subjectService } from "@/services/subjectService";
import type { College } from "@/types/college";
import type { Department } from "@/types/department";
import type { Subject } from "@/types/subject";

interface AcademicCascadeOptions {
  /** Include subject level in the cascade (for exams) */
  withSubjects?: boolean;
}

/**
 * Manages the College → Department → Subject cascade.
 * When college changes, departments reload and department resets.
 * When department changes, subjects reload (if withSubjects).
 */
export function useAcademicCascade({ withSubjects = false }: AcademicCascadeOptions = {}) {
  const [colleges, setColleges] = useState<College[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingColleges, setLoadingColleges] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Load colleges once
  useEffect(() => {
    setLoadingColleges(true);
    collegeService
      .getAll({ size: 500 })
      .then((res) => {
        const data = res.data?.data;
        const list = Array.isArray(data) ? data : (data as { content?: College[] })?.content ?? [];
        setColleges(list);
      })
      .catch(() => setColleges([]))
      .finally(() => setLoadingColleges(false));
  }, []);

  const loadDepartments = useCallback((collegeId: number) => {
    if (!collegeId) {
      setDepartments([]);
      setSubjects([]);
      return;
    }
    setLoadingDepartments(true);
    departmentService
      .getByCollege(collegeId)
      .then((res) => {
        const data = res.data?.data;
        setDepartments(Array.isArray(data) ? data : []);
      })
      .catch(() => setDepartments([]))
      .finally(() => setLoadingDepartments(false));
  }, []);

  const loadSubjects = useCallback(
    (departmentId: number, collegeId?: number) => {
      if (!withSubjects) return;
      if (!departmentId && !collegeId) {
        setSubjects([]);
        return;
      }
      setLoadingSubjects(true);
      const promise = departmentId
        ? subjectService.getByDepartment(departmentId)
        : subjectService.getByCollege(collegeId!);

      promise
        .then((res) => {
          const data = res.data?.data;
          setSubjects(Array.isArray(data) ? data : []);
        })
        .catch(() => setSubjects([]))
        .finally(() => setLoadingSubjects(false));
    },
    [withSubjects]
  );

  return {
    colleges,
    departments,
    subjects,
    loadingColleges,
    loadingDepartments,
    loadingSubjects,
    loadDepartments,
    loadSubjects,
  };
}

export function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ? age - 1
    : age;
}

export function validateTrialEligibility(
  age: number,
  gender: string,
  bloodGroup: string,
  genotype: string,
  conditions: string[],
  requirements: {
    minAge?: number;
    maxAge?: number;
    genders?: string[];
    bloodGroups?: string[];
    genotypes?: string[];
    conditions?: string[];
  },
): {
  isValid: boolean;
  reason?: string;
} {
  if (requirements.minAge !== undefined && age < requirements.minAge) {
    return {
      isValid: false,
      reason: `Age ${age} is below the minimum required age of ${requirements.minAge}`,
    };
  }

  if (requirements.maxAge !== undefined && age > requirements.maxAge) {
    return {
      isValid: false,
      reason: `Age ${age} is above the maximum required age of ${requirements.maxAge}`,
    };
  }

  if (requirements.genders && requirements.genders.length > 0) {
    if (!requirements.genders.includes(gender)) {
      return {
        isValid: false,
        reason: `Gender ${gender} is not eligible for this trial`,
      };
    }
  }

  if (requirements.bloodGroups && requirements.bloodGroups.length > 0) {
    if (!requirements.bloodGroups.includes(bloodGroup)) {
      return {
        isValid: false,
        reason: `Blood group ${bloodGroup} is not eligible for this trial`,
      };
    }
  }

  if (requirements.genotypes && requirements.genotypes.length > 0) {
    if (!requirements.genotypes.includes(genotype)) {
      return {
        isValid: false,
        reason: `Genotype ${genotype} is not eligible for this trial`,
      };
    }
  }

  if (requirements.conditions && requirements.conditions.length > 0) {
    const hasRequiredCondition = requirements.conditions.some((reqCondition) =>
      conditions.includes(reqCondition),
    );
    if (!hasRequiredCondition) {
      return {
        isValid: false,
        reason: `None of the required conditions (${requirements.conditions.join(', ')}) are present in the credential`,
      };
    }
  }

  return {
    isValid: true,
  };
}


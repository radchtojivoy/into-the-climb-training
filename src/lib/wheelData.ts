function gradeScale(): string[] {
  const grades = ['4a', '4b', '4c']
  for (const n of ['5', '6', '7', '8', '9']) {
    for (const l of ['a', 'b', 'c']) {
      grades.push(n + l)
      grades.push(n + l + '+')
    }
  }
  return grades
}

export const WEIGHT_VALUES = Array.from({ length: 111 }, (_, i) => String(30 + i))
export const HEIGHT_VALUES = Array.from({ length: 81 }, (_, i) => String(130 + i))
export const GRADE_VALUES = gradeScale()

export const WEIGHT_DEFAULT = '58'
export const HEIGHT_DEFAULT = '167'
export const GRADE_RP_DEFAULT = '6c+'
export const GRADE_OS_DEFAULT = '6b'

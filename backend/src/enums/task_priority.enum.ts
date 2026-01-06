export const taskPriorityEnum = {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH"
} as const

export type TaskPriorityEnumType = keyof typeof taskPriorityEnum;
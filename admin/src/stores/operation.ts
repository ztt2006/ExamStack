import { defineStore } from 'pinia'

import type { OperationLog } from '@/types'

interface OperationState {
  logs: OperationLog[]
}

export const useOperationStore = defineStore('operation', {
  state: (): OperationState => ({
    logs: [
      {
        id: 'seed-1',
        module: '系统',
        action: '初始化',
        target: '管理后台',
        operator: 'ExamStack',
        status: 'success',
        createdAt: new Date().toISOString(),
      },
    ],
  }),
  actions: {
    record(log: Omit<OperationLog, 'id' | 'createdAt'>) {
      this.logs.unshift({
        ...log,
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        createdAt: new Date().toISOString(),
      })
      this.logs = this.logs.slice(0, 80)
    },
    clear() {
      this.logs = []
    },
  },
})

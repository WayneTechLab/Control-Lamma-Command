import type { InstalledModel, RunningModel } from '@/types/ollama'

export const sampleInstalledModels: InstalledModel[] = [
  {
    name: 'llama3.2:latest',
    model: 'llama3.2:latest',
    modified_at: '2026-06-10T18:14:00Z',
    size: 2019393189,
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '3.2B',
      quantization_level: 'Q4_K_M',
    },
  },
  {
    name: 'mistral:latest',
    model: 'mistral:latest',
    modified_at: '2026-06-08T09:25:00Z',
    size: 4113301824,
    details: {
      format: 'gguf',
      family: 'mistral',
      parameter_size: '7B',
      quantization_level: 'Q4_0',
    },
  },
  {
    name: 'codellama:7b',
    model: 'codellama:7b',
    modified_at: '2026-06-04T21:11:00Z',
    size: 3825819519,
    details: {
      format: 'gguf',
      family: 'llama',
      parameter_size: '7B',
      quantization_level: 'Q4_K_M',
    },
  },
]

export const sampleRunningModels: RunningModel[] = [
  {
    ...sampleInstalledModels[0],
    size_vram: 1468006400,
    expires_at: '2026-06-11T22:30:00Z',
    processor: 'GPU',
  },
]

import { PiniaPluginContext, PiniaCustomProperties, PiniaCustomStateProperties } from 'pinia'

export interface Pinia {
  init: (context: PiniaPluginContext) => void
  use: (context: PiniaPluginContext) => Partial<PiniaCustomProperties & PiniaCustomStateProperties> | void
}

export const pinia: Pinia

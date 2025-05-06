import checker from "../../addons/checker/checker"
import type { Message } from "./Message"

export type PluginJson = {
  // Уникальный идентификатор плагина. Используется для различия плагинов.
  uid: string

  // Название плагина.
  name: string

  // Описание плагина, предоставляющее информацию о его назначении и функциях.
  description: string

  // Версия плагина в формате семантического версионирования.
  version: string

  // (Необязательное) Список авторов плагина. Массив строк, представляющий имена или контакты авторов.
  authors?: string[]

  // (Необязательное) Зависимости плагина в виде словаря,
  // где ключ — это имя пакета, а значение — версия, необходимая для работы плагина.
  dependencies?: Record<string, string | "*">

  // (Необязательное) Объект, описывающий совместимые версии основной программы или платформы.
  // Может содержать минимальную (min) или максимальную (max) совместимую версию.
  // Символ `*` означает совместимость с любой версией.
  compatibleVersions?: { min?: string | "*"; max?: string | "*" } & (
    | {
        min: string
      }
    | {
        max: string
      }
  )
}

export interface Plugin extends PluginJson {
  // Метод инициализации плагина, вызываемый при его загрузке.
  init(props: PluginProps): void
}

export type PluginProps = {
  onMessage(props: Message): void
  checker: typeof checker
}

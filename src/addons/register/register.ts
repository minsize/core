// Импорты утилит и функций для работы с версиями
import { parseVersionString } from "@minsize/utils" // Для разбора строковых версий
import { version } from "../../../package.json" // Текущая версия приложения из `package.json`

import { onMessage } from "./events" // Функция для регистрации и обработки сообщений

// Импорты для управления состоянием и типизации
import store from "../../store" // Хранилище для управления состоянием приложения
import type { Plugin } from "../../types" // Тип данных `Plugin`

/**
 * Регистрация плагина
 *
 * Эта функция добавляет массив плагинов к уже существующему
 * списку плагинов и инициализирует каждый из добавленных плагинов,
 * вызывая их метод `init`.
 *
 * @param plugins - Массив плагинов, которые необходимо зарегистрировать и инициализировать.
 */
export function register(plugins: Plugin[]) {
  // Добавляем все переданные плагины в существующий массив плагинов.
  store.plugins.push(...plugins)

  // Инициализируем каждый из переданных плагинов после добавления
  for (const plugin of plugins) {
    // Проверка необходимых полей перед инициализацией плагина
    if (!plugin.uid || !plugin.version || !plugin.name || !plugin.init) {
      // Отправляем критическое сообщение о некорректном конфиге плагина
      onMessage(
        {
          type: "critical",
          details: "config (plugin.json) has errors and cannot be run",
        },
        plugin,
      )
    }

    // Флаг для отслеживания несовместимости версии
    let errorVersion = false

    // Проверка минимально совместимой версии плагина
    if (plugin.compatibleVersions?.min) {
      const projectVersion = parseVersionString(version) // Разбор текущей версии проекта
      const compatibleVersions = parseVersionString(
        plugin.compatibleVersions.min,
      ) // Разбор минимальной совместимой версии плагина

      // Сравнение основной, подверсии и версии патча
      if (compatibleVersions.major !== "*" && projectVersion.major !== "*") {
        if (projectVersion.major < compatibleVersions.major) {
          errorVersion = true
        }
      }
      if (compatibleVersions.minor !== "*" && projectVersion.minor !== "*") {
        if (!errorVersion && projectVersion.minor < compatibleVersions.minor) {
          errorVersion = true
        }
      }
      if (compatibleVersions.patch !== "*" && projectVersion.patch !== "*") {
        if (!errorVersion && projectVersion.patch < compatibleVersions.patch) {
          errorVersion = true
        }
      }
    }

    // Проверка максимально совместимой версии плагина
    if (plugin.compatibleVersions?.max) {
      const projectVersion = parseVersionString(version) // Разбор текущей версии проекта
      const compatibleVersions = parseVersionString(
        plugin.compatibleVersions.max,
      ) // Разбор максимальной совместимой версии плагина

      // Сравнение основной, подверсии и версии патча
      if (compatibleVersions.major !== "*" && projectVersion.major !== "*") {
        if (projectVersion.major > compatibleVersions.major) {
          errorVersion = true
        }
      }
      if (compatibleVersions.minor !== "*" && projectVersion.minor !== "*") {
        if (!errorVersion && projectVersion.minor > compatibleVersions.minor) {
          errorVersion = true
        }
      }
      if (compatibleVersions.patch !== "*" && projectVersion.patch !== "*") {
        if (!errorVersion && projectVersion.patch > compatibleVersions.patch) {
          errorVersion = true
        }
      }
    }

    // Выводим предупреждение, если версия плагина несовместима с ядром
    if (errorVersion) {
      onMessage(
        {
          type: "warning",
          details: "the plugin version cannot work with the core version",
        },
        plugin,
      )
    }

    // Пытаемся инициализировать плагин
    try {
      // Вызываем метод `init` в контексте плагина, передавая функции `onMessage` и `verify`
      plugin.init()
    } catch (error) {
      // Отправляем критическое сообщение, если произошла ошибка при инициализации
      onMessage(
        {
          type: "critical",
          details: {
            message: "an error occurred during initialization",
            error,
          },
        },
        plugin,
      )
    } finally {
      // Отправляем отладочное сообщение об успешной инициализации
      onMessage(
        {
          type: "debug",
          details: "plugin initialization successful",
        },
        plugin,
      )
    }
  }
}

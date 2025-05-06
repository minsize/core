import { parseVersionString } from "@minsize/utils" // Импорт функции для разбора строковых версий
import store from "../../store" // Импорт хранилища для управления состоянием приложения
import type { Plugin } from "../../types" // Импорт типа данных `Plugin`
import verify from "../checker/verify/verify" // Импорт функции для верификации
import { onMessage } from "./events" // Импорт функции для регистрации и обработки сообщений
import { version } from "../../package.json" // Импорт текущей версии приложения из `package.json`

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
      onMessage.bind(plugin)({
        type: "critical",
        details: "config (plugin.json) has errors and cannot be run",
      })
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
      if (projectVersion.major < compatibleVersions.major) {
        errorVersion = true
      }
      if (!errorVersion && projectVersion.minor < compatibleVersions.minor) {
        errorVersion = true
      }
      if (!errorVersion && projectVersion.patch < compatibleVersions.patch) {
        errorVersion = true
      }
    }

    // Проверка максимально совместимой версии плагина
    if (plugin.compatibleVersions?.max) {
      const projectVersion = parseVersionString(version) // Разбор текущей версии проекта
      const compatibleVersions = parseVersionString(
        plugin.compatibleVersions.max,
      ) // Разбор максимальной совместимой версии плагина

      // Сравнение основной, подверсии и версии патча
      if (projectVersion.major > compatibleVersions.major) {
        errorVersion = true
      }
      if (!errorVersion && projectVersion.minor > compatibleVersions.minor) {
        errorVersion = true
      }
      if (!errorVersion && projectVersion.patch > compatibleVersions.patch) {
        errorVersion = true
      }
    }

    // Выводим предупреждение, если версия плагина несовместима с ядром
    if (errorVersion) {
      onMessage.bind(plugin)({
        type: "warning",
        details: "the plugin version cannot work with the core version",
      })
    }

    // Пытаемся инициализировать плагин
    try {
      // Вызываем метод `init` в контексте плагина, передавая функции `onMessage` и `verify`
      plugin.init({
        onMessage: onMessage.bind(plugin),
        verify,
      })
    } catch (error) {
      // Отправляем критическое сообщение, если произошла ошибка при инициализации
      onMessage.bind(plugin)({
        type: "critical",
        details: {
          message: "an error occurred during initialization",
          error,
        },
      })
    } finally {
      // Отправляем отладочное сообщение об успешной инициализации
      onMessage.bind(plugin)({
        type: "debug",
        details: "plugin initialization successful",
      })
    }
  }
}

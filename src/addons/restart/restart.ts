import { log } from "../../plugin"
import store from "../../store" // Импортируем общий store для доступа к данным плагинов
import { RestartProps } from "../../types" // Импортируем типы для параметров перезапуска

/**
 * Перезапускает указанные плагины на основе переданных параметров
 *
 * @param props - Опции для рестарта, определяющие, какие плагины перезапустить
 * @returns объект с результатами перезапуска, где ключ - uid плагина, а значение - успех или неудача
 */
export async function restart(
  props?: RestartProps,
): Promise<Record<string, boolean>> {
  // Проверяем, нужно ли перезапустить все плагины или только указанные
  const isAll = !props || props.all || !props.uids

  // Получаем список плагинов, которые необходимо перезапустить
  const pluginsToRestart = store.plugins.filter((plugin) =>
    isAll ? true : props.uids?.includes(plugin.uid) ?? false,
  )

  const report: Record<string, boolean> = {}

  // Перезапускаем каждый из отфильтрованных плагинов
  for (const plugin of pluginsToRestart) {
    try {
      const status = await plugin.restart()
      if (status === false) {
        // Выводим предупреждение, если плагин не смог перезапуститься
        log.send(
          {
            type: "warning",
            details: {
              message: "reported that it was not possible to restart",
            },
          },
          plugin,
        )
      }
      if (typeof status === "boolean") {
        report[plugin.uid] = status
      }
    } catch (error) {
      report[plugin.uid] = false
      // Отправляем критическое сообщение, если произошла ошибка при перезапуске
      log.send(
        {
          type: "critical",
          details: {
            message: "error on restart",
            error,
          },
        },
        plugin,
      )
    } finally {
      if (report[plugin.uid] === undefined) {
        report[plugin.uid] = true
      }

      // Отправляем отладочное сообщение об успешном перезапуске
      log.send(
        {
          type: "debug",
          details: {
            message: "successfully restarted",
          },
        },
        plugin,
      )
    }
  }

  return report
}

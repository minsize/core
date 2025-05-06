import store from "store" // Импортируем общий store для доступа к данным плагинов
import { RestartProps } from "types" // Импортируем тип для параметров перезапуска

/**
 * Перезапускает указанные плагины на основе переданных параметров
 *
 * @param props - Опции для рестарта, определяющие, какие плагины перезапустить
 */
export function restart(props?: RestartProps) {
  // Определяем, нужно ли перезапустить все плагины
  const isAll = !props || props.all || !props.uids

  // Фильтруем плагины, которые подлежат перезапуску
  const pluginsToRestart = store.plugins.filter((plugin) =>
    (isAll ? [plugin.uid] : props.uids)?.includes(plugin.uid),
  )

  // Перезапускаем каждый из отфильтрованных плагинов
  for (const plugin of pluginsToRestart) {
    plugin.restart()
  }
}

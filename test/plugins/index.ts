import type { Plugin, PluginProps } from "../../src/types"

import plugin from "./plugin.json"

function init(props: PluginProps) {
  function lang(text: string) {
    if (props.checker.verify(lang, plugin.uid)) return ""

    return `${text} [modifier]`
  }

  globalThis.lang = lang
}

function install(): Plugin {
  return {
    ...plugin,
    init,
  }
}

// Расширяем глобальное пространство имен с помощью `declare global`
declare global {
  var lang: (text: string) => string
}

export default install

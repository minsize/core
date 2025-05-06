import { register, restart } from "./addons"

const mcore = {
  register,
  restart,
}

export default mcore

export { checker } from "./plugin"

export type * from "./types"

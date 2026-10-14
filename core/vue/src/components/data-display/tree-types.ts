/**
 * Tree 节点的运行时读取类型。
 *
 * Tree 的字段名（nodeKey/labelField/childrenField/disabledField）均由调用方配置，
 * 节点本身可以是任意具名接口（无需包含索引签名）。泛型组件对外保留调用方的节点
 * 类型 T；内部按动态字段名读取时统一收窄为本记录类型，转换只发生在组件边界。
 */
export type TreeRecord = Record<string, unknown>;

# Button

T0 操作原语，用于触发提交、导航与次要操作。

## 基础

<DemoWrap>
  <ButtonBasicDemo />
</DemoWrap>

## 状态

<DemoWrap>
  <ButtonStateDemo />
</DemoWrap>

## 尺寸

<DemoWrap>
  <ButtonSizeDemo />
</DemoWrap>

## Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| variant | `primary` \| `secondary` \| `text` \| `danger` \| `icon` \| `ghost` | `primary` | 视觉变体 |
| size | `sm` \| `md` \| `lg` | 继承 SizeScope | 尺寸 |
| loading | `boolean` | `false` | 加载态 |
| disabled | `boolean` | `false` | 禁用 |
| type | `button` \| `submit` \| `reset` | `button` | 原生 type |
| fullWidth | `boolean` | `false` | 撑满容器 |

## 反模式

- 原生 `<button>` 替代 T0 Button
- 在 `toolbar` 内绕过 `SizeScope` 硬编码尺寸

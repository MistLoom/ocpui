/** AbnormalList 异常项数据契约（抽到类型层，供 barrel 导出与消费方引用） */
export interface AbnormalItem {
  id: string;
  /** 异常分类编码 */
  type: string;
  /** 分类展示文案 */
  typeLabel: string;
  timestamp: string;
  userId: string;
  username: string;
  userAvatar?: string;
  description: string;
  riskLevel: 'high' | 'medium' | 'low';
  status: 'pending' | 'processed' | 'ignored';
  details?: Record<string, unknown>;
}

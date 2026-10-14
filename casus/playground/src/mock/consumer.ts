export interface FeedItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  cover: string;
  author: string;
  readMin: number;
  likes: number;
  epoch: string;
}

export interface ChronicleEvent {
  id: string;
  title: string;
  description: string;
  time: string;
  era: string;
  type: 'milestone' | 'conflict' | 'discovery' | 'culture';
}

export interface HeroSlide {
  image: string;
  title: string;
  description: string;
  alt: string;
}

const CATEGORIES = ['全部', '编年', '人物', '技术', '文化', '冲突'];

const COVER_GRADIENTS = [
  'linear-gradient(135deg, hsl(220 70% 45%), hsl(260 60% 55%))',
  'linear-gradient(135deg, hsl(160 55% 38%), hsl(190 60% 42%))',
  'linear-gradient(135deg, hsl(30 80% 50%), hsl(10 70% 48%))',
  'linear-gradient(135deg, hsl(280 55% 48%), hsl(320 60% 52%))',
  'linear-gradient(135deg, hsl(200 60% 42%), hsl(170 55% 40%))',
];

let feedSeq = 0;

function makeFeedItem(category: string, index: number): FeedItem {
  feedSeq += 1;
  const id = `feed-${feedSeq}`;
  return {
    id,
    title: `${category}专题 · ${['量子纪元', '星际联盟', '深空协议', '文明交汇'][index % 4]}`,
    summary: '多源史料交叉验证后的叙事摘要，支持展开阅读与关联跳转。',
    category,
    cover: COVER_GRADIENTS[index % COVER_GRADIENTS.length],
    author: ['林澜', '陈序', '赵衡', '沈微'][index % 4],
    readMin: 3 + (index % 8),
    likes: 120 + index * 17,
    epoch: `E${2400 + index}`,
  };
}

export function getCategories() {
  return [...CATEGORIES];
}

export function getHeroSlides(): HeroSlide[] {
  return [
    {
      image: '',
      title: '发现流 · 本周精选',
      description: 'Carousel + aspectRatio，移动端可滑动切换',
      alt: '本周精选',
    },
    {
      image: '',
      title: '编年史新章上线',
      description: 'Timeline 叙事 + 响应式侧栏筛选',
      alt: '编年史新章',
    },
    {
      image: '',
      title: '跨端阅读体验',
      description: 'BottomNav / Grid 断点 / Drawer 详情',
      alt: '跨端体验',
    },
  ];
}

export function getInitialFeed(): FeedItem[] {
  feedSeq = 0;
  const items: FeedItem[] = [];
  for (let i = 0; i < 12; i += 1) {
    items.push(makeFeedItem(CATEGORIES[(i % (CATEGORIES.length - 1)) + 1], i));
  }
  return items;
}

export async function fetchMoreFeed(page: number, category: string): Promise<FeedItem[]> {
  await delay(600);
  const cat = category === '全部' ? CATEGORIES[(page % (CATEGORIES.length - 1)) + 1] : category;
  return Array.from({ length: 6 }, (_, i) => makeFeedItem(cat, page * 6 + i));
}

export function getChronicleEvents(): ChronicleEvent[] {
  return [
    {
      id: 'c1',
      title: '第一跃迁通道贯通',
      description: '人类舰队完成首次稳定跃迁，编年体系进入 E2401。跃迁窗口稳定时长首次达到 4.2 小时，为后续航道商业化和军事部署奠定基础。',
      time: '2401-03-12',
      era: '跃迁纪元',
      type: 'milestone',
    },
    {
      id: 'c2',
      title: '深空协议签署',
      description: '五方势力在轨道站达成资源与航道分配框架，确立联合观测与冲突仲裁机制。',
      time: '2401-08-02',
      era: '跃迁纪元',
      type: 'discovery',
    },
    {
      id: 'c3',
      title: '航道测绘网络启动',
      description: '首批自主测绘无人机编队进入外环星域，实时回传数据接入发现流。',
      time: '2401-11-20',
      era: '跃迁纪元',
      type: 'milestone',
    },
    {
      id: 'c4',
      title: '边缘冲突升级',
      description: '贸易航线遭袭，引发多轮外交斡旋与军事对峙，冲突期正式拉开序幕。',
      time: '2402-01-19',
      era: '冲突期',
      type: 'conflict',
    },
    {
      id: 'c5',
      title: '轨道站紧急疏散',
      description: '三座前哨轨道站完成 72 小时内全员转移，民用航运暂停两周。',
      time: '2402-03-05',
      era: '冲突期',
      type: 'conflict',
    },
    {
      id: 'c6',
      title: '停火谈判重启',
      description: '中立区会谈恢复，五方代表就航道保险与护航配额达成临时安排。',
      time: '2402-05-18',
      era: '冲突期',
      type: 'discovery',
    },
    {
      id: 'c7',
      title: '文明档案公开',
      description: '失落文明语料库向公众开放，推动跨学科研究热潮，复兴期标志性事件。',
      time: '2402-06-30',
      era: '复兴期',
      type: 'culture',
    },
    {
      id: 'c8',
      title: '联合观测站落成',
      description: '多星域同步观测网络投入运行，实时数据汇入发现流与编年校验管道。',
      time: '2403-02-14',
      era: '复兴期',
      type: 'milestone',
    },
    {
      id: 'c9',
      title: '跨域学院成立',
      description: '联合设立编年史与航图学交叉学院，公开课程覆盖 12 个星域时区。',
      time: '2403-06-01',
      era: '复兴期',
      type: 'culture',
    },
    {
      id: 'c10',
      title: '发现流公测',
      description: '面向公众的个性化内容推荐与编年关联阅读上线，移动端 BottomNav 同步发布。',
      time: '2403-09-15',
      era: '复兴期',
      type: 'milestone',
    },
  ];
}

export interface SearchEntry {
  id: string;
  title: string;
  description: string;
  category: 'entry' | 'epoch' | 'person';
  keywords: string[];
}

export interface ProfileMenuItem {
  key: string;
  label: string;
  icon: string;
  extra?: string;
}

const SEARCH_CATALOG: SearchEntry[] = [
  { id: 's1', title: '深空协议', description: '2401 年五方签署 · 跃迁纪元', category: 'entry', keywords: ['协议', '深空', '航道'] },
  { id: 's2', title: '第一跃迁通道', description: 'E2401 贯通事件', category: 'entry', keywords: ['跃迁', '通道'] },
  { id: 's3', title: 'E2402 冲突期', description: '贸易航线危机与停火谈判', category: 'epoch', keywords: ['冲突', 'E2402'] },
  { id: 's4', title: '复兴期', description: '2402 下半年至 2403', category: 'epoch', keywords: ['复兴'] },
  { id: 's5', title: '林澜', description: '编年史研究员 · 128 篇著作', category: 'person', keywords: ['林澜', '作者'] },
  { id: 's6', title: '陈序', description: '航道测绘首席分析师', category: 'person', keywords: ['陈序'] },
  { id: 's7', title: '文明档案公开', description: '失落文明语料库开放', category: 'entry', keywords: ['档案', '文明'] },
  { id: 's8', title: '发现流公测', description: 'C 端内容推荐上线', category: 'entry', keywords: ['发现', '公测'] },
];

export function getSearchCatalog() {
  return [...SEARCH_CATALOG];
}

export function searchCatalog(query: string, category: string): SearchEntry[] {
  const q = query.trim().toLowerCase();
  return SEARCH_CATALOG.filter((item) => {
    if (category !== '全部' && item.category !== category) return false;
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q)
      || item.description.toLowerCase().includes(q)
      || item.keywords.some((k) => k.toLowerCase().includes(q))
    );
  });
}

export function getRecentSearches() {
  return ['深空协议', '林澜', 'E2402'];
}

export function getProfileStats() {
  return {
    reads: 128,
    favorites: 36,
    following: 12,
  };
}

export function getProfileMenu(): ProfileMenuItem[] {
  return [
    { key: 'favorites', label: '我的收藏', icon: 'heart', extra: '36' },
    { key: 'history', label: '阅读历史', icon: 'clock', extra: '128' },
    { key: 'notes', label: '读书笔记', icon: 'file-text', extra: '8' },
    { key: 'settings', label: '偏好设置', icon: 'settings' },
    { key: 'about', label: '关于演示', icon: 'info' },
  ];
}

export function groupChronicleByEra(events: ChronicleEvent[]) {
  const order: string[] = [];
  const map = new Map<string, ChronicleEvent[]>();
  for (const event of events) {
    if (!map.has(event.era)) {
      map.set(event.era, []);
      order.push(event.era);
    }
    map.get(event.era)!.push(event);
  }
  return order.map((era) => ({ era, events: map.get(era)! }));
}

export function chronicleTypeLabel(type: ChronicleEvent['type']) {
  const map: Record<ChronicleEvent['type'], string> = {
    milestone: '里程碑',
    conflict: '冲突',
    discovery: '发现',
    culture: '文化',
  };
  return map[type];
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// Navigation and routing types
export interface NavigationItem {
  id: string;
  label: string;
  path?: string;
  icon?: string;
  badge?: NavigationBadge;
  children?: NavigationItem[];
  roles?: string[];
  permissions?: string[];
  external?: boolean;
  target?: '_self' | '_blank' | '_parent' | '_top';
  disabled?: boolean;
  hidden?: boolean;
  order?: number;
}

export interface NavigationBadge {
  text: string;
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  variant: 'solid' | 'outline' | 'soft';
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface RouteConfig {
  path: string;
  component: React.ComponentType<any>;
  exact?: boolean;
  layout?: React.ComponentType<any>;
  auth?: boolean;
  roles?: string[];
  permissions?: string[];
  title?: string;
  meta?: RouteMeta;
  children?: RouteConfig[];
}

export interface RouteMeta {
  title?: string;
  description?: string;
  keywords?: string[];
  noIndex?: boolean;
  canonical?: string;
  ogImage?: string;
}

export interface NavigationState {
  currentPath: string;
  breadcrumbs: BreadcrumbItem[];
  activeItem?: string;
  expandedItems: string[];
  history: string[];
}

export interface SidebarConfig {
  collapsed: boolean;
  width: number;
  collapsedWidth: number;
  position: 'left' | 'right';
  variant: 'permanent' | 'persistent' | 'temporary';
  items: NavigationItem[];
}

export interface TabConfig {
  id: string;
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
  closeable?: boolean;
  icon?: string;
  badge?: NavigationBadge;
}

export interface TabsState {
  activeTab: string;
  tabs: TabConfig[];
  orientation: 'horizontal' | 'vertical';
  variant: 'default' | 'pills' | 'underline';
}

// Page layout types
export interface PageLayout {
  header?: boolean;
  sidebar?: boolean;
  footer?: boolean;
  breadcrumbs?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface HeaderConfig {
  logo?: string;
  title?: string;
  navigation?: NavigationItem[];
  actions?: React.ReactNode;
  searchEnabled?: boolean;
  notificationsEnabled?: boolean;
  userMenuEnabled?: boolean;
}

export interface FooterConfig {
  copyright?: string;
  links?: NavigationItem[];
  social?: SocialLink[];
  showLogo?: boolean;
}

export interface SocialLink {
  platform: 'facebook' | 'twitter' | 'linkedin' | 'github' | 'instagram' | 'youtube';
  url: string;
  icon?: string;
}

// Menu and dropdown types
export interface MenuConfig {
  trigger: React.ReactNode;
  items: MenuItem[];
  placement?: 'top' | 'bottom' | 'left' | 'right';
  offset?: number;
  closeOnSelect?: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  separator?: boolean;
  submenu?: MenuItem[];
  onClick?: () => void;
}

// Navigation hooks and utilities
export interface UseNavigationOptions {
  preserveScrollPosition?: boolean;
  replace?: boolean;
  state?: any;
}

export interface NavigationHistory {
  length: number;
  entries: HistoryEntry[];
  index: number;
}

export interface HistoryEntry {
  pathname: string;
  search: string;
  hash: string;
  state?: any;
  key: string;
  timestamp: number;
}

// Mobile navigation
export interface MobileNavigationConfig {
  showBottomNavigation?: boolean;
  showHamburgerMenu?: boolean;
  bottomNavItems?: NavigationItem[];
  swipeGestures?: boolean;
}

// Search and command palette
export interface SearchConfig {
  enabled: boolean;
  placeholder?: string;
  categories?: SearchCategory[];
  shortcuts?: SearchShortcut[];
  recentSearches?: boolean;
  suggestions?: boolean;
}

export interface SearchCategory {
  id: string;
  label: string;
  icon?: string;
  searchFunction: (query: string) => Promise<SearchResult[]>;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  category: string;
  url: string;
  icon?: string;
  action?: () => void;
}

export interface SearchShortcut {
  key: string;
  description: string;
  action: () => void;
}

// Progressive Web App navigation
export interface PWANavigationConfig {
  installPrompt?: boolean;
  backButton?: boolean;
  share?: boolean;
  fullscreen?: boolean;
}

// Navigation performance
export interface NavigationMetrics {
  pageLoadTime: number;
  navigationTime: number;
  renderTime: number;
  interactiveTime: number;
}

// Accessibility
export interface NavigationA11y {
  skipLinks?: SkipLink[];
  landmarks?: boolean;
  announcements?: boolean;
  keyboardNavigation?: boolean;
  focusManagement?: boolean;
}

export interface SkipLink {
  id: string;
  label: string;
  target: string;
}

// Router guards and middleware
export interface RouteGuard {
  name: string;
  condition: (route: RouteConfig, user?: any) => boolean | Promise<boolean>;
  redirect?: string;
  message?: string;
}

export interface RouteMiddleware {
  name: string;
  execute: (route: RouteConfig, next: () => void) => void | Promise<void>;
}

// Dynamic routing
export interface DynamicRoute {
  pattern: string;
  component: React.ComponentType<any>;
  loader?: (params: Record<string, string>) => Promise<any>;
  params?: Record<string, any>;
}

// Route transitions
export interface RouteTransition {
  enter: string;
  exit: string;
  duration: number;
  easing?: string;
}

export interface TransitionConfig {
  enabled: boolean;
  default: RouteTransition;
  custom?: Record<string, RouteTransition>;
}
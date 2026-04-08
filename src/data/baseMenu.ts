interface MenuItem {
  title: string,
  key: string,
  active?: boolean,
  icon: string
}
const menuData: MenuItem[] = [
  { title: "BaseMenu.Video.Title", key: 'video', icon: 'icon-qudao_line' },
];

export { menuData };
export type { MenuItem };
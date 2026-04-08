import { DefineComponent, Plugin, Ref } from 'vue';
import { I18n } from 'vue-i18n';
import { StoreDefinition } from 'pinia';

export declare const HeaderContainer: DefineComponent<{}, {}, any>;
export declare const ResourcesContainer: DefineComponent<{}, {}, any>;
export declare const ControllerPreview: DefineComponent<{}, {}, any>;
export declare const AttributeContainer: DefineComponent<{}, {}, any>;
export declare const TrackContainer: DefineComponent<{}, {}, any>;
export declare const GlobalConfigDialog: DefineComponent<{}, {}, any>;

export declare function setupAolesI18n(i18nInstance: I18n): void;

export declare const aolesLocales: {
  zh: Record<string, any>;
  en: Record<string, any>;
};

export declare const usePageState: StoreDefinition;
export declare const useTrackState: StoreDefinition;
export declare const usePreviewState: StoreDefinition;

declare const plugin: Plugin;
export default plugin;

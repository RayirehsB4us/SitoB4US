import type { Schema, Struct } from '@strapi/strapi';

export interface CarFleetAccesBlock extends Struct.ComponentSchema {
  collectionName: 'components_car_fleet_acces_blocks';
  info: {
    description: 'Punto elenco accesso intelligente (testo con bold prima dei due punti, icona)';
    displayName: 'Acces Block';
  };
  attributes: {
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarFleetDashboardPanoramica extends Struct.ComponentSchema {
  collectionName: 'components_car_fleet_dashboard_panoramicas';
  info: {
    description: 'Card panoramica dashboard (icona, titolo, valore, descrizione)';
    displayName: 'Dashboard Panoramica';
  };
  attributes: {
    content: Schema.Attribute.Text;
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarFleetIconText extends Struct.ComponentSchema {
  collectionName: 'components_car_fleet_icon_texts';
  info: {
    description: 'Chip icona + testo (es: Tracciamento GPS)';
    displayName: 'Icon Text';
  };
  attributes: {
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarFleetMappaFlotta extends Struct.ComponentSchema {
  collectionName: 'components_car_fleet_mappa_flottas';
  info: {
    description: 'Sezione mappa flotta con pin, conducente e stato';
    displayName: 'Mappa Flotta';
  };
  attributes: {
    Car: Schema.Attribute.String;
    Icon1: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Icon2: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Icon3: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    MappaTitle: Schema.Attribute.String;
    Name: Schema.Attribute.String;
    PIcon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Status: Schema.Attribute.String;
    Tag: Schema.Attribute.String;
  };
}

export interface CarFleetPowerappsBlock extends Struct.ComponentSchema {
  collectionName: 'components_car_fleet_powerapps_blocks';
  info: {
    description: 'Blocco funzionalita PowerApps (icona, titolo, descrizione)';
    displayName: 'Powerapps Block';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CarriereCultureCard extends Struct.ComponentSchema {
  collectionName: 'components_carriere_culture_cards';
  info: {
    description: "Card per la sezione 'Perch\u00E9 scegliere B4US?'";
    displayName: 'Culture Card';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ChiSiamoValueCard extends Struct.ComponentSchema {
  collectionName: 'components_chi_siamo_value_cards';
  info: {
    description: 'Card con icona, titolo e descrizione per i valori aziendali';
    displayName: 'Value Card';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContattiContactDetail extends Struct.ComponentSchema {
  collectionName: 'components_contatti_contact_details';
  info: {
    description: 'Dettaglio di contatto (telefono, email, social)';
    displayName: 'Contact Detail';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    linkText: Schema.Attribute.String;
    linkUrl: Schema.Attribute.String;
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsAccesSmart extends Struct.ComponentSchema {
  collectionName: 'components_open4us_acces_smarts';
  info: {
    description: 'Chip feature hero (icona + testo, es: Configurazione Istantanea)';
    displayName: 'Acces Smart';
  };
  attributes: {
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsAppBlock extends Struct.ComponentSchema {
  collectionName: 'components_open4us_app_blocks';
  info: {
    description: 'Funzionalita app Open4US (icona, titolo, descrizione)';
    displayName: 'App Block';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsAppIcon extends Struct.ComponentSchema {
  collectionName: 'components_open4us_app_icons';
  info: {
    description: 'Icona grande app con testo (sezione Luckey App)';
    displayName: 'App Icon';
  };
  attributes: {
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Text: Schema.Attribute.String;
  };
}

export interface Open4UsCalendarBlock extends Struct.ComponentSchema {
  collectionName: 'components_open4us_calendar_blocks';
  info: {
    description: 'Card dettaglio prenotazione calendario';
    displayName: 'Calendar Block';
  };
  attributes: {
    Access: Schema.Attribute.String;
    Date: Schema.Attribute.String;
    Icon1: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Icon2: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Icon3: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Name: Schema.Attribute.String;
    Status: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsDashboardOption extends Struct.ComponentSchema {
  collectionName: 'components_open4us_dashboard_options';
  info: {
    description: 'Voce menu sidebar dashboard (icona + testo)';
    displayName: 'Dashboard Option';
  };
  attributes: {
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsImageCard extends Struct.ComponentSchema {
  collectionName: 'components_open4us_image_cards';
  info: {
    description: 'Card con immagine serratura smart (titolo e sottotitolo)';
    displayName: 'Image Card';
  };
  attributes: {
    SubTitle: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsSmartBlock extends Struct.ComponentSchema {
  collectionName: 'components_open4us_smart_blocks';
  info: {
    description: 'Blocco smartphone con icona, titolo e descrizione';
    displayName: 'Smart Block';
  };
  attributes: {
    Description: Schema.Attribute.String;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface Open4UsSpaceBlock extends Struct.ComponentSchema {
  collectionName: 'components_open4us_space_blocks';
  info: {
    description: "Card caso d'uso spazio (icona, titolo, descrizione)";
    displayName: 'Space Block';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OrganizzazioneHeroCard extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_hero_cards';
  info: {
    description: 'Card singola dentro una HeroSection (titolo, sottotitolo, contenuto lista)';
    displayName: 'Hero Card';
  };
  attributes: {
    content: Schema.Attribute.Text;
    subTitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OrganizzazioneHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_hero_sections';
  info: {
    description: 'Sezione hero ripetibile con tag, titolo, sottotitolo e cards';
    displayName: 'Hero Section';
  };
  attributes: {
    card: Schema.Attribute.Component<'organizzazione.hero-card', true>;
    SubTitle: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    tag: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OrganizzazioneKnowledgeArea extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_knowledge_areas';
  info: {
    description: 'Sezione Knowledge Days';
    displayName: 'Knowledge Area';
  };
  attributes: {
    content: Schema.Attribute.RichText &
      Schema.Attribute.CustomField<
        'plugin::ckeditor5.CKEditor',
        {
          preset: 'defaultHtml';
        }
      >;
    MainCard: Schema.Attribute.Component<'organizzazione.main-card', false>;
    subCard: Schema.Attribute.Component<'organizzazione.sub-card', true>;
  };
}

export interface OrganizzazioneMainCard extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_main_cards';
  info: {
    description: 'Card principale nella sezione Knowledge Days';
    displayName: 'Main Card';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    subTitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OrganizzazioneSubCard extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_sub_cards';
  info: {
    description: 'Sottocard nella sezione Knowledge Days';
    displayName: 'Sub Card';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    subTitle: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface OrganizzazioneTechArea extends Struct.ComponentSchema {
  collectionName: 'components_organizzazione_tech_areas';
  info: {
    description: 'Sezione aree di formazione con relazione ai Tag';
    displayName: 'Tech Area';
  };
  attributes: {
    tags: Schema.Attribute.Relation<'oneToMany', 'api::tag.tag'>;
    title: Schema.Attribute.String;
  };
}

export interface ProdottiBulletpointCar extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_bulletpoint_cars';
  info: {
    description: 'Punto elenco funzionalita CarFleet (icona, titolo, descrizione)';
    displayName: 'Bulletpoint Car';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProdottiCarfleetProduct extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_carfleet_products';
  info: {
    description: 'Sezione prodotto CarFleet nella pagina prodotti';
    displayName: 'Carfleet Product';
  };
  attributes: {
    bulletpointcar: Schema.Attribute.Component<
      'prodotti.bulletpoint-car',
      true
    >;
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    icon2: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Image: Schema.Attribute.Media<'images'>;
    Link: Schema.Attribute.String;
    subtitle: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProdottiDashboardPrenotazioni extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_dashboard_prenotazioni';
  info: {
    description: 'Sezione dashboard prenotazioni nella pagina prodotti';
    displayName: 'Dashboard Prenotazioni';
  };
  attributes: {
    Prenotazioni: Schema.Attribute.Component<'prodotti.prenotazione', true>;
    Status: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface ProdottiOpen4UsBlock extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_open4us_blocks';
  info: {
    description: 'Blocco funzionalita Open4US nella pagina prodotti (icona, titolo, descrizione)';
    displayName: 'Open4us Block';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProdottiOpen4UsProduct extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_open4us_products';
  info: {
    description: 'Sezione prodotto Open4US nella pagina prodotti';
    displayName: 'Open4us Product';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Image: Schema.Attribute.Media<'images'>;
    Open4usBlocks: Schema.Attribute.Component<'prodotti.open4us-block', true>;
    SubTitle: Schema.Attribute.String;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProdottiPrenotazione extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_prenotazioni';
  info: {
    description: 'Singola prenotazione nella dashboard (titolo, data, icona, contenuto)';
    displayName: 'Prenotazione';
  };
  attributes: {
    content: Schema.Attribute.String;
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    subTitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ProdottiProdotti extends Struct.ComponentSchema {
  collectionName: 'components_prodotti_prodottis';
  info: {
    displayName: 'prodotti';
  };
  attributes: {
    blog_post: Schema.Attribute.Relation<
      'oneToOne',
      'api::blog-post.blog-post'
    >;
    stile: Schema.Attribute.Enumeration<['stile1', 'stile2', 'stile3']>;
  };
}

export interface ProdottoFeature extends Struct.ComponentSchema {
  collectionName: 'components_prodotto_features';
  info: {
    description: 'Feature/blocco funzionalita di un prodotto (icona, titolo, descrizione)';
    displayName: 'Prodotto Feature';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceOurSkills extends Struct.ComponentSchema {
  collectionName: 'components_service_our_skills';
  info: {
    description: 'Sezione competenze con tag e titolo';
    displayName: 'Our Skills';
  };
  attributes: {
    Tag: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface SharedBarElement extends Struct.ComponentSchema {
  collectionName: 'components_shared_bar_elements';
  info: {
    displayName: 'BarElement';
  };
  attributes: {
    label: Schema.Attribute.String;
    path: Schema.Attribute.String;
    sottoMenu: Schema.Attribute.Component<'shared.sotto-menu', true>;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedButtonCta extends Struct.ComponentSchema {
  collectionName: 'components_shared_button_ctas';
  info: {
    displayName: 'ButtonCta';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    Label: Schema.Attribute.String;
    Usage: Schema.Attribute.Enumeration<['modale', 'link']>;
  };
}

export interface SharedCardContent extends Struct.ComponentSchema {
  collectionName: 'components_shared_card_contents';
  info: {
    displayName: 'CardContent';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    tags: Schema.Attribute.Component<'shared.tags', true>;
    Title: Schema.Attribute.String;
  };
}

export interface SharedColonna extends Struct.ComponentSchema {
  collectionName: 'components_shared_colonnas';
  info: {
    displayName: 'Colonna';
  };
  attributes: {
    link: Schema.Attribute.Component<'shared.link', true>;
    Title: Schema.Attribute.String;
  };
}

export interface SharedElementoMegaMenu extends Struct.ComponentSchema {
  collectionName: 'components_shared_elemento_mega_menus';
  info: {
    displayName: 'ElementoMegaMenu';
  };
  attributes: {
    barElement: Schema.Attribute.Component<'shared.bar-element', true>;
  };
}

export interface SharedFooter extends Struct.ComponentSchema {
  collectionName: 'components_shared_footers';
  info: {
    displayName: 'Footer';
  };
  attributes: {
    Colonna: Schema.Attribute.Component<'shared.colonna', true>;
    Descrizione: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    subTitle: Schema.Attribute.Text;
  };
}

export interface SharedLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_links';
  info: {
    displayName: 'Link';
  };
  attributes: {
    icon: Schema.Attribute.String &
      Schema.Attribute.CustomField<'plugin::icon-picker.icon'>;
    link: Schema.Attribute.String;
    Title: Schema.Attribute.String;
  };
}

export interface SharedSottoMenu extends Struct.ComponentSchema {
  collectionName: 'components_shared_sotto_menus';
  info: {
    displayName: 'sottoMenu';
  };
  attributes: {
    label: Schema.Attribute.String;
    path: Schema.Attribute.String;
    visible: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
  };
}

export interface SharedTags extends Struct.ComponentSchema {
  collectionName: 'components_shared_tags';
  info: {
    displayName: 'tags';
  };
  attributes: {
    Tag: Schema.Attribute.String;
    tagValue: Schema.Attribute.Text;
  };
}

export interface SharedTitle extends Struct.ComponentSchema {
  collectionName: 'components_shared_titles';
  info: {
    displayName: 'Title';
  };
  attributes: {
    Description: Schema.Attribute.Text;
    Title: Schema.Attribute.String;
  };
}

export interface StoriaTimelineEvent extends Struct.ComponentSchema {
  collectionName: 'components_storia_timeline_events';
  info: {
    description: 'Evento nella cronologia aziendale';
    displayName: 'Timeline Event';
  };
  attributes: {};
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'car-fleet.acces-block': CarFleetAccesBlock;
      'car-fleet.dashboard-panoramica': CarFleetDashboardPanoramica;
      'car-fleet.icon-text': CarFleetIconText;
      'car-fleet.mappa-flotta': CarFleetMappaFlotta;
      'car-fleet.powerapps-block': CarFleetPowerappsBlock;
      'carriere.culture-card': CarriereCultureCard;
      'chi-siamo.value-card': ChiSiamoValueCard;
      'contatti.contact-detail': ContattiContactDetail;
      'open4us.acces-smart': Open4UsAccesSmart;
      'open4us.app-block': Open4UsAppBlock;
      'open4us.app-icon': Open4UsAppIcon;
      'open4us.calendar-block': Open4UsCalendarBlock;
      'open4us.dashboard-option': Open4UsDashboardOption;
      'open4us.image-card': Open4UsImageCard;
      'open4us.smart-block': Open4UsSmartBlock;
      'open4us.space-block': Open4UsSpaceBlock;
      'organizzazione.hero-card': OrganizzazioneHeroCard;
      'organizzazione.hero-section': OrganizzazioneHeroSection;
      'organizzazione.knowledge-area': OrganizzazioneKnowledgeArea;
      'organizzazione.main-card': OrganizzazioneMainCard;
      'organizzazione.sub-card': OrganizzazioneSubCard;
      'organizzazione.tech-area': OrganizzazioneTechArea;
      'prodotti.bulletpoint-car': ProdottiBulletpointCar;
      'prodotti.carfleet-product': ProdottiCarfleetProduct;
      'prodotti.dashboard-prenotazioni': ProdottiDashboardPrenotazioni;
      'prodotti.open4us-block': ProdottiOpen4UsBlock;
      'prodotti.open4us-product': ProdottiOpen4UsProduct;
      'prodotti.prenotazione': ProdottiPrenotazione;
      'prodotti.prodotti': ProdottiProdotti;
      'prodotto.feature': ProdottoFeature;
      'service.our-skills': ServiceOurSkills;
      'shared.bar-element': SharedBarElement;
      'shared.button-cta': SharedButtonCta;
      'shared.card-content': SharedCardContent;
      'shared.colonna': SharedColonna;
      'shared.elemento-mega-menu': SharedElementoMegaMenu;
      'shared.footer': SharedFooter;
      'shared.link': SharedLink;
      'shared.sotto-menu': SharedSottoMenu;
      'shared.tags': SharedTags;
      'shared.title': SharedTitle;
      'storia.timeline-event': StoriaTimelineEvent;
    }
  }
}

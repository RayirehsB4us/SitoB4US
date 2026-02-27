import type { Attribute, Schema } from '@strapi/strapi';

export interface CarFleetAccesBlock extends Schema.Component {
  collectionName: 'components_car_fleet_acces_blocks';
  info: {
    description: 'Punto elenco accesso intelligente (testo con bold prima dei due punti, icona)';
    displayName: 'Acces Block';
  };
  attributes: {
    Icon: Attribute.String;
    Text: Attribute.String & Attribute.Required;
  };
}

export interface CarFleetDashboardPanoramica extends Schema.Component {
  collectionName: 'components_car_fleet_dashboard_panoramicas';
  info: {
    description: 'Card panoramica dashboard (icona, titolo, valore, descrizione)';
    displayName: 'Dashboard Panoramica';
  };
  attributes: {
    content: Attribute.Text;
    icon: Attribute.String;
    subTitle: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface CarFleetIconText extends Schema.Component {
  collectionName: 'components_car_fleet_icon_texts';
  info: {
    description: 'Chip icona + testo (es: Tracciamento GPS)';
    displayName: 'Icon Text';
  };
  attributes: {
    Icon: Attribute.String;
    Text: Attribute.String & Attribute.Required;
  };
}

export interface CarFleetMappaFlotta extends Schema.Component {
  collectionName: 'components_car_fleet_mappa_flottas';
  info: {
    description: 'Sezione mappa flotta con pin, conducente e stato';
    displayName: 'Mappa Flotta';
  };
  attributes: {
    Car: Attribute.String;
    Icon1: Attribute.String;
    Icon2: Attribute.String;
    Icon3: Attribute.String;
    MappaTitle: Attribute.String;
    Name: Attribute.String;
    PIcon: Attribute.String;
    Status: Attribute.String;
    Tag: Attribute.String;
  };
}

export interface CarFleetPowerappsBlock extends Schema.Component {
  collectionName: 'components_car_fleet_powerapps_blocks';
  info: {
    description: 'Blocco funzionalita PowerApps (icona, titolo, descrizione)';
    displayName: 'Powerapps Block';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface CarriereCultureCard extends Schema.Component {
  collectionName: 'components_carriere_culture_cards';
  info: {
    description: "Card per la sezione 'Perch\u00E9 scegliere B4US?'";
    displayName: 'Culture Card';
  };
  attributes: {
    description: Attribute.Text;
    icon: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ContattiContactDetail extends Schema.Component {
  collectionName: 'components_contatti_contact_details';
  info: {
    description: 'Dettaglio di contatto (telefono, email, social)';
    displayName: 'Contact Detail';
  };
  attributes: {
    icon: Attribute.String;
    linkText: Attribute.String;
    linkUrl: Attribute.String;
    subTitle: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsAccesSmart extends Schema.Component {
  collectionName: 'components_open4us_acces_smarts';
  info: {
    description: 'Chip feature hero (icona + testo, es: Configurazione Istantanea)';
    displayName: 'Acces Smart';
  };
  attributes: {
    Icon: Attribute.String;
    Text: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsAppBlock extends Schema.Component {
  collectionName: 'components_open4us_app_blocks';
  info: {
    description: 'Funzionalita app Open4US (icona, titolo, descrizione)';
    displayName: 'App Block';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsAppIcon extends Schema.Component {
  collectionName: 'components_open4us_app_icons';
  info: {
    description: 'Icona grande app con testo (sezione Luckey App)';
    displayName: 'App Icon';
  };
  attributes: {
    Icon: Attribute.String;
    Text: Attribute.String;
  };
}

export interface Open4UsCalendarBlock extends Schema.Component {
  collectionName: 'components_open4us_calendar_blocks';
  info: {
    description: 'Card dettaglio prenotazione calendario';
    displayName: 'Calendar Block';
  };
  attributes: {
    Access: Attribute.String;
    Date: Attribute.String;
    Icon1: Attribute.String;
    Icon2: Attribute.String;
    Icon3: Attribute.String;
    Name: Attribute.String;
    Status: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsDashboardOption extends Schema.Component {
  collectionName: 'components_open4us_dashboard_options';
  info: {
    description: 'Voce menu sidebar dashboard (icona + testo)';
    displayName: 'Dashboard Option';
  };
  attributes: {
    Icon: Attribute.String;
    Text: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsImageCard extends Schema.Component {
  collectionName: 'components_open4us_image_cards';
  info: {
    description: 'Card con immagine serratura smart (titolo e sottotitolo)';
    displayName: 'Image Card';
  };
  attributes: {
    SubTitle: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsSmartBlock extends Schema.Component {
  collectionName: 'components_open4us_smart_blocks';
  info: {
    description: 'Blocco smartphone con icona, titolo e descrizione';
    displayName: 'Smart Block';
  };
  attributes: {
    Description: Attribute.String;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface Open4UsSpaceBlock extends Schema.Component {
  collectionName: 'components_open4us_space_blocks';
  info: {
    description: "Card caso d'uso spazio (icona, titolo, descrizione)";
    displayName: 'Space Block';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface OrganizzazioneHeroCard extends Schema.Component {
  collectionName: 'components_organizzazione_hero_cards';
  info: {
    description: 'Card singola dentro una HeroSection (titolo, sottotitolo, contenuto lista)';
    displayName: 'Hero Card';
  };
  attributes: {
    content: Attribute.Text;
    subTitle: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface OrganizzazioneHeroSection extends Schema.Component {
  collectionName: 'components_organizzazione_hero_sections';
  info: {
    description: 'Sezione hero ripetibile con tag, titolo, sottotitolo e cards';
    displayName: 'Hero Section';
  };
  attributes: {
    card: Attribute.Component<'organizzazione.hero-card', true>;
    SubTitle: Attribute.Text;
    tag: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface OrganizzazioneKnowledgeArea extends Schema.Component {
  collectionName: 'components_organizzazione_knowledge_areas';
  info: {
    description: 'Sezione Knowledge Days';
    displayName: 'Knowledge Area';
  };
  attributes: {
    content: Attribute.Text;
    MainCard: Attribute.Component<'organizzazione.main-card'>;
    subCard: Attribute.Component<'organizzazione.sub-card', true>;
  };
}

export interface OrganizzazioneMainCard extends Schema.Component {
  collectionName: 'components_organizzazione_main_cards';
  info: {
    description: 'Card principale nella sezione Knowledge Days';
    displayName: 'Main Card';
  };
  attributes: {
    icon: Attribute.String;
    subTitle: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface OrganizzazioneSubCard extends Schema.Component {
  collectionName: 'components_organizzazione_sub_cards';
  info: {
    description: 'Sottocard nella sezione Knowledge Days';
    displayName: 'Sub Card';
  };
  attributes: {
    icon: Attribute.String;
    subTitle: Attribute.Text;
    title: Attribute.String & Attribute.Required;
  };
}

export interface OrganizzazioneTechArea extends Schema.Component {
  collectionName: 'components_organizzazione_tech_areas';
  info: {
    description: 'Sezione aree di formazione con relazione ai Tag';
    displayName: 'Tech Area';
  };
  attributes: {
    tags: Attribute.Relation<
      'organizzazione.tech-area',
      'oneToMany',
      'api::tag.tag'
    >;
    title: Attribute.String;
  };
}

export interface ProdottiBulletpointCar extends Schema.Component {
  collectionName: 'components_prodotti_bulletpoint_cars';
  info: {
    description: 'Punto elenco funzionalita CarFleet (icona, titolo, descrizione)';
    displayName: 'Bulletpoint Car';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface ProdottiCarfleetProduct extends Schema.Component {
  collectionName: 'components_prodotti_carfleet_products';
  info: {
    description: 'Sezione prodotto CarFleet nella pagina prodotti';
    displayName: 'Carfleet Product';
  };
  attributes: {
    bulletpointcar: Attribute.Component<'prodotti.bulletpoint-car', true>;
    Description: Attribute.Text;
    Icon: Attribute.String;
    icon2: Attribute.String;
    Image: Attribute.Media<'images'>;
    Link: Attribute.String;
    subtitle: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface ProdottiDashboardPrenotazioni extends Schema.Component {
  collectionName: 'components_prodotti_dashboard_prenotazioni';
  info: {
    description: 'Sezione dashboard prenotazioni nella pagina prodotti';
    displayName: 'Dashboard Prenotazioni';
  };
  attributes: {
    Prenotazioni: Attribute.Component<'prodotti.prenotazione', true>;
    Status: Attribute.String;
    Title: Attribute.String;
  };
}

export interface ProdottiOpen4UsBlock extends Schema.Component {
  collectionName: 'components_prodotti_open4us_blocks';
  info: {
    description: 'Blocco funzionalita Open4US nella pagina prodotti (icona, titolo, descrizione)';
    displayName: 'Open4us Block';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface ProdottiOpen4UsProduct extends Schema.Component {
  collectionName: 'components_prodotti_open4us_products';
  info: {
    description: 'Sezione prodotto Open4US nella pagina prodotti';
    displayName: 'Open4us Product';
  };
  attributes: {
    Description: Attribute.Text;
    Icon: Attribute.String;
    Image: Attribute.Media<'images'>;
    Open4usBlocks: Attribute.Component<'prodotti.open4us-block', true>;
    SubTitle: Attribute.String;
    Title: Attribute.String & Attribute.Required;
  };
}

export interface ProdottiPrenotazione extends Schema.Component {
  collectionName: 'components_prodotti_prenotazioni';
  info: {
    description: 'Singola prenotazione nella dashboard (titolo, data, icona, contenuto)';
    displayName: 'Prenotazione';
  };
  attributes: {
    content: Attribute.String;
    icon: Attribute.String;
    subTitle: Attribute.String;
    title: Attribute.String & Attribute.Required;
  };
}

export interface ServiceOurSkills extends Schema.Component {
  collectionName: 'components_service_our_skills';
  info: {
    description: 'Sezione competenze con tag e titolo';
    displayName: 'Our Skills';
  };
  attributes: {
    Tag: Attribute.String;
    Title: Attribute.String;
  };
}

export interface StoriaTimelineEvent extends Schema.Component {
  collectionName: 'components_storia_timeline_events';
  info: {
    description: 'Evento nella cronologia aziendale';
    displayName: 'Timeline Event';
  };
  attributes: {
    Anno: Attribute.String & Attribute.Required;
    Descrizione: Attribute.Text & Attribute.Required;
    Foto: Attribute.Media<'images'>;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'car-fleet.acces-block': CarFleetAccesBlock;
      'car-fleet.dashboard-panoramica': CarFleetDashboardPanoramica;
      'car-fleet.icon-text': CarFleetIconText;
      'car-fleet.mappa-flotta': CarFleetMappaFlotta;
      'car-fleet.powerapps-block': CarFleetPowerappsBlock;
      'carriere.culture-card': CarriereCultureCard;
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
      'service.our-skills': ServiceOurSkills;
      'storia.timeline-event': StoriaTimelineEvent;
    }
  }
}

# Un solo store Zustand per lo stato volatile condiviso

L'handover (§8) sconsiglia uno store globale "per principio". Usiamo comunque un unico store Zustand (`src/state/global-state.ts`, diviso in slice), perché i bisogni sono concreti:

- la sessione audio è letta da mini-player, player completo, pannello tablet e notifica;
- il cuore dei preferiti deve aggiornarsi su tutte le schermate;
- ricerca, tag selezionato e stato del download devono sopravvivere al passaggio fra layout compatto e layout a tre colonne, che rimonta l'albero dei componenti.

SQLite resta l'unica fonte persistente. Lo store contiene solo stato in memoria e non introduce un layer repository. Non vanno creati altri store globali.

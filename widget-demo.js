/**
 * Widget Chat — Démo commerciale (version neutre)
 * Aucune référence à un restaurant spécifique.
 * Basé sur widget.js — ne pas modifier widget.js.
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIGURATION
     ---------------------------------------------------------- */
  var CONFIG = {
    restaurantName: "Votre Restaurant",
    subtitle:       "Je réponds à vos clients 24h/24 💬",
    avatar:         "💬",
    welcomeMessage: "Bonjour ! 👋 Besoin d'une table ou d'une information ? Je suis là pour vous aider !",
    placeholder:    "Écrivez votre message…",
    cssPath:        "widget.css",
    poweredBy:      "ChatResto",
    delaiReponse:   700,
  };

  /* ----------------------------------------------------------
     WEB3FORMS
     ---------------------------------------------------------- */
  var WEB3FORMS_KEY    = "552cd89a-c288-4ac7-9cb5-e2efcf0ae4ef";
  var RESTAURANT_EMAIL = "contact@lane-arrose.fr";

  /* ----------------------------------------------------------
     RÉPONSES — données génériques pour la démo
     ---------------------------------------------------------- */
  var REP = {
    horaires:
      "Voici nos horaires (exemple) :\n\n" +
      "• Lundi : fermé\n" +
      "• Mardi – Jeudi : midi 12h–14h / soir 19h–22h\n" +
      "• Vendredi – Samedi : midi 12h–14h30 / soir 19h–22h30\n" +
      "• Dimanche : midi 12h–14h30 (soir fermé)\n\n" +
      "Ces horaires sont entièrement personnalisables.\n" +
      "La réservation est conseillée le week-end !",

    menu:
      "Voici notre carte (exemple) 🍽️\n\n" +
      "Entrées (à partir de 8€)\n" +
      "• Entrée du jour\n" +
      "• Soupe de saison\n" +
      "• Assiette de charcuterie\n\n" +
      "Plats (à partir de 14€)\n" +
      "• Plat du jour\n" +
      "• Pièce de viande du boucher\n" +
      "• Poisson du marché\n\n" +
      "Desserts (à partir de 6€)\n" +
      "• Dessert du jour\n" +
      "• Sélection de fromages affinés\n\n" +
      "Menu du jour : entrée + plat + dessert\n" +
      "(La carte s'adapte entièrement à votre restaurant)",

    adresse:
      "Vous nous trouverez ici 📍\n\n" +
      "Votre adresse\n" +
      "Votre ville\n\n" +
      "L'assistant peut afficher votre adresse exacte, vos indications de parking, et tout ce dont vos clients ont besoin.",

    prix:
      "Voici notre gamme de prix (exemple) :\n\n" +
      "• Entrées : à partir de 8€\n" +
      "• Plats : à partir de 14€\n" +
      "• Desserts : à partir de 6€\n" +
      "• Menu du jour : entrée + plat + dessert\n\n" +
      "Ces tarifs sont un exemple — l'assistant affiche vos vrais prix.\n" +
      "Une table vous ferait plaisir ?",

    enfants:
      "Les enfants sont les bienvenus ! 😊\n\n" +
      "Des chaises hautes sont disponibles sur demande.\n" +
      "Un menu enfant peut être proposé selon votre carte.",

    parking:
      "Pas de souci pour vous garer !\n\n" +
      "L'assistant peut indiquer à vos clients toutes vos informations de stationnement.",

    terrasse:
      "Oui, nous disposons d'une terrasse !\n\n" +
      "L'assistant peut préciser sa capacité, sa disponibilité selon les saisons, et si les animaux y sont acceptés.",

    regimes:
      "Nous nous adaptons à vos besoins !\n\n" +
      "Des options végétariennes sont disponibles à la carte.\n\n" +
      "Pour toute allergie (gluten, lactose…), signalez-le à la réservation : notre cuisine s'adapte avec plaisir.",

    animaux:
      "Votre compagnon est le bienvenu ! 🐾\n\n" +
      "L'assistant peut préciser votre politique d'accueil des animaux, en terrasse ou en salle.",

    fallback:
      "Je n'ai pas bien compris votre question 😅 Voici ce que je peux vous aider à faire :",

    confirmationResa:
      "Votre réservation est confirmée ! 🎉 Un email récapitulatif vous a été envoyé. À très bientôt !",

    erreurResa:
      "Une erreur s'est produite lors de l'envoi 😕\n\n" +
      "Appelez-nous directement au Votre numéro, nous nous occupons de vous.",
  };

  /* ----------------------------------------------------------
     10 RÈGLES MOTS-CLÉS (mode normal)
     rep: null = déclenche la réservation
     ---------------------------------------------------------- */
  var REGLES = [
    { mots: ["horaire", "ouvert", "ferme", "fermé", "ouvre", "ouverture"],                                       rep: REP.horaires },
    { mots: ["menu", "plat", "manger", "carte", "cuisine"],                                                      rep: REP.menu     },
    { mots: ["adresse", "trouver", "situe", "situé", "rue"],                                                     rep: REP.adresse  },
    { mots: ["reserv", "réserv", "table", "venir"],                                                              rep: null         },
    { mots: ["prix", "tarif", "cher", "cout", "coût"],                                                           rep: REP.prix     },
    { mots: ["enfant", "famille", "kids"],                                                                       rep: REP.enfants  },
    { mots: ["parking", "garer", "voiture", "stationner"],                                                       rep: REP.parking  },
    { mots: ["terrasse", "dehors", "exterieur", "extérieur"],                                                    rep: REP.terrasse },
    { mots: ["gluten", "vege", "végé", "vegan", "végan", "allergi", "regime", "régime", "vegetar", "végétar"],  rep: REP.regimes  },
    { mots: ["chien", "animal", "animaux"],                                                                      rep: REP.animaux  },
  ];

  /* ----------------------------------------------------------
     ÉTAT DE LA RÉSERVATION
     ---------------------------------------------------------- */
  var ETAT = {
    mode:          'normal',
    etape:         0,
    enTraitement:  false,
    dateEnAttente: null,
    donnees:       { nom: '', date: '', heure: '', personnes: '', telephone: '', email: '', message: '' },
  };

  /* Tooltip d'appel — état et timers */
  var chatOpenedOnce = false;
  var tipTimer1 = null;
  var tipTimer2 = null;

  /* ----------------------------------------------------------
     HELPERS
     ---------------------------------------------------------- */
  function normalise(t) {
    return t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g,  "&amp;")
      .replace(/</g,  "&lt;")
      .replace(/>/g,  "&gt;")
      .replace(/"/g,  "&quot;");
  }

  function setInputDisabled(disabled) {
    ETAT.enTraitement = disabled;
    var send = document.getElementById("ane-chat-send");
    if (send) { send.disabled = disabled; }
    if (!disabled) {
      var input = document.getElementById("ane-chat-input");
      if (input) { input.focus(); }
    }
  }

  function addMessage(type, texte) {
    var zone   = document.getElementById("ane-chat-messages");
    var div    = document.createElement("div");
    div.className = "ane-msg " + type;
    var bubble = document.createElement("div");
    bubble.className = "ane-msg-bubble";
    bubble.innerHTML = escapeHtml(texte).replace(/\n/g, "<br>");
    div.appendChild(bubble);
    zone.appendChild(div);
    zone.scrollTop = zone.scrollHeight;
  }

  function showTyping(callback) {
    var zone = document.getElementById("ane-chat-messages");
    var div  = document.createElement("div");
    div.id        = "ane-typing";
    div.className = "ane-msg bot";
    div.innerHTML = '<div class="ane-msg-bubble ane-typing-dots"><span></span><span></span><span></span></div>';
    zone.appendChild(div);
    zone.scrollTop = zone.scrollHeight;
    setTimeout(function () {
      var el = document.getElementById("ane-typing");
      if (el) { el.parentNode.removeChild(el); }
      callback();
    }, CONFIG.delaiReponse);
  }

  /* ----------------------------------------------------------
     BOUTONS D'ÉTAPE (temporaires — dans la zone messages)
     ---------------------------------------------------------- */
  function showStepButtons(labels, onClickLabel) {
    removeStepButtons();
    var zone = document.getElementById("ane-chat-messages");
    var row  = document.createElement("div");
    row.id        = "ane-step-btns";
    row.className = "ane-step-btns-row";
    labels.forEach(function (label) {
      var btn = document.createElement("button");
      btn.className   = "ane-step-btn";
      btn.textContent = label;
      btn.addEventListener("click", function () {
        removeStepButtons();
        addMessage("user", label);
        onClickLabel(label);
      });
      row.appendChild(btn);
    });
    zone.appendChild(row);
    zone.scrollTop = zone.scrollHeight;
  }

  function removeStepButtons() {
    var el = document.getElementById("ane-step-btns");
    if (el) {
      el.parentNode.removeChild(el);
      var input = document.getElementById("ane-chat-input");
      if (input) { input.focus(); }
    }
  }

  /* ----------------------------------------------------------
     MASQUER / AFFICHER les 4 boutons principaux
     ---------------------------------------------------------- */
  function hideMainButtons() {
    var el = document.getElementById("ane-quick-btns");
    if (el) { el.style.display = "none"; }
  }

  function showMainButtons() {
    var el = document.getElementById("ane-quick-btns");
    if (el) { el.style.display = ""; }
  }

  /* ----------------------------------------------------------
     UTILITAIRES DATE
     ---------------------------------------------------------- */
  function formaterDate(d) {
    return String(d.getDate()).padStart(2, '0') + '/' +
           String(d.getMonth() + 1).padStart(2, '0') + '/' +
           d.getFullYear();
  }

  function demain() {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }

  function validerDate(texte) {
    var match = texte.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match) { return { ok: false, type: 'format' }; }
    var j = parseInt(match[1], 10);
    var m = parseInt(match[2], 10) - 1;
    var a = parseInt(match[3], 10);
    var d = new Date(a, m, j);
    if (d.getDate() !== j || d.getMonth() !== m || d.getFullYear() !== a) {
      return { ok: false, type: 'format' };
    }
    var auj = new Date(); auj.setHours(0, 0, 0, 0);
    if (d < auj) { return { ok: false, type: 'passe' }; }
    return { ok: true, valeur: texte.trim() };
  }

  /* Validation email basique */
  function validerEmail(texte) {
    var e = texte.trim();
    return e.indexOf('@') > 0 && e.lastIndexOf('.') > e.indexOf('@') + 1 && e.length >= 6;
  }

  /* ----------------------------------------------------------
     RECONNAISSANCE DE DATE EN LANGAGE NATUREL
     ---------------------------------------------------------- */
  function detecterDateNaturelle(texte) {
    var t = normalise(texte.trim());
    var d = new Date();
    if (t === 'demain') {
      d.setDate(d.getDate() + 1); return formaterDate(d);
    }
    if (t === 'apres-demain' || t === 'apres demain') {
      d.setDate(d.getDate() + 2); return formaterDate(d);
    }
    if (t === 'dans 3 jours') {
      d.setDate(d.getDate() + 3); return formaterDate(d);
    }
    if (t === 'dans 4 jours') {
      d.setDate(d.getDate() + 4); return formaterDate(d);
    }
    return null;
  }

  function estConfirmation(texte) {
    return /^(oui|ok|yes|ouais|parfait|correct|exactement|tout a fait|c est (ca|bon)|affirmatif)/.test(
      normalise(texte.trim())
    );
  }

  function estRefus(texte) {
    return /^(non|no|nope|pas ca|changer|incorrect)/.test(
      normalise(texte.trim())
    );
  }

  /* Email de confirmation envoyé au client */
  function buildAutoresponse(d) {
    var nb = d.personnes + " personne" + (d.personnes === "1" ? "" : "s");
    return "Bonjour " + d.nom + ",\n\n" +
      "Votre réservation est bien enregistrée.\n\n" +
      "Récapitulatif :\n" +
      "• Date : " + d.date + "\n" +
      "• Heure : " + d.heure + "\n" +
      "• Personnes : " + nb + "\n" +
      "• Téléphone : " + d.telephone + "\n" +
      (d.message !== "Aucun message particulier" ? "• Message : " + d.message + "\n" : "") +
      "\nÀ très bientôt !\n\n" +
      "Votre Restaurant\n" +
      "Votre adresse\n" +
      "Votre numéro";
  }

  /* ----------------------------------------------------------
     FLUX DE RÉSERVATION — 7 étapes
     ---------------------------------------------------------- */
  function demarrerReservation() {
    ETAT.mode          = 'reservation';
    ETAT.etape         = 1;
    ETAT.dateEnAttente = null;
    ETAT.donnees       = { nom: '', date: '', heure: '', personnes: '', telephone: '', email: '', message: '' };
    hideMainButtons();
    showTyping(function () {
      addMessage("bot",
        "Parfait, je vous guide pour votre réservation !\n\n" +
        "Étape 1/7 — Quel est votre prénom et nom ?"
      );
      setInputDisabled(false);
    });
  }

  function traiterEtape(texte) {
    removeStepButtons();
    ETAT.enTraitement = true;

    switch (ETAT.etape) {

      case 1: /* Nom */
        ETAT.donnees.nom = texte;
        ETAT.etape = 2;
        showTyping(function () {
          addMessage("bot",
            "Merci ! 😊\n\n" +
            "Étape 2/7 — Quelle date souhaitez-vous réserver ?\n" +
            "(JJ/MM/AAAA, ex : " + formaterDate(demain()) + " — ou dites : demain, après-demain, dans 3 jours…)"
          );
          setInputDisabled(false);
        });
        break;

      case 2: /* Date — langage naturel ou format JJ/MM/AAAA */

        if (ETAT.dateEnAttente) {
          if (estConfirmation(texte)) {
            ETAT.donnees.date  = ETAT.dateEnAttente;
            ETAT.dateEnAttente = null;
            ETAT.etape         = 3;
            showTyping(function () {
              addMessage("bot", "Étape 3/7 — À quelle heure souhaitez-vous venir ?");
              showStepButtons(
                ["12h", "12h30", "19h", "19h30", "20h", "20h30"],
                function (val) { traiterEtape(val); }
              );
              setInputDisabled(false);
            });
          } else if (estRefus(texte)) {
            ETAT.dateEnAttente = null;
            showTyping(function () {
              addMessage("bot",
                "Pas de problème ! Quelle date préférez-vous ?\n" +
                "(JJ/MM/AAAA ou : demain, après-demain, dans 3 jours, dans 4 jours)"
              );
              setInputDisabled(false);
            });
          } else {
            var dateProposee = ETAT.dateEnAttente;
            showTyping(function () {
              addMessage("bot", "Je confirme bien le " + dateProposee + " ?");
              showStepButtons(["Oui", "Non"], function (val) { traiterEtape(val); });
              setInputDisabled(false);
            });
          }
          break;
        }

        var dateNat = detecterDateNaturelle(texte);
        if (dateNat) {
          ETAT.dateEnAttente = dateNat;
          showTyping(function () {
            addMessage("bot", "Parfait, j'ai noté le " + dateNat + ". C'est bien ça ?");
            showStepButtons(["Oui", "Non"], function (val) { traiterEtape(val); });
            setInputDisabled(false);
          });
          break;
        }

        var vDate = validerDate(texte);
        if (!vDate.ok) {
          var msgDate = vDate.type === 'passe'
            ? "Cette date est déjà passée, pouvez-vous choisir une date à venir ?"
            : "Je n'ai pas reconnu cette date.\n" +
              "Utilisez le format JJ/MM/AAAA (ex : " + formaterDate(demain()) + ")\n" +
              "ou dites : demain, après-demain, dans 3 jours, dans 4 jours.";
          showTyping(function () {
            addMessage("bot", msgDate);
            setInputDisabled(false);
          });
          break;
        }
        ETAT.donnees.date = vDate.valeur;
        ETAT.etape = 3;
        showTyping(function () {
          addMessage("bot", "Étape 3/7 — À quelle heure souhaitez-vous venir ?");
          showStepButtons(
            ["12h", "12h30", "19h", "19h30", "20h", "20h30"],
            function (val) { traiterEtape(val); }
          );
          setInputDisabled(false);
        });
        break;

      case 3: /* Heure */
        ETAT.donnees.heure = texte;
        ETAT.etape = 4;
        showTyping(function () {
          addMessage("bot", "Étape 4/7 — Combien de personnes ?");
          showStepButtons(
            ["1", "2", "3", "4", "5", "6+"],
            function (val) { traiterEtape(val); }
          );
          setInputDisabled(false);
        });
        break;

      case 4: /* Personnes */
        ETAT.donnees.personnes = texte;
        ETAT.etape = 5;
        showTyping(function () {
          addMessage("bot", "Étape 5/7 — Votre numéro de téléphone ?");
          setInputDisabled(false);
        });
        break;

      case 5: /* Téléphone */
        ETAT.donnees.telephone = texte;
        ETAT.etape = 6;
        showTyping(function () {
          addMessage("bot",
            "Étape 6/7 — Votre adresse email ?\n" +
            "(pour recevoir la confirmation de réservation)"
          );
          setInputDisabled(false);
        });
        break;

      case 6: /* Email — avec validation */
        if (!validerEmail(texte)) {
          showTyping(function () {
            addMessage("bot",
              "Cette adresse ne semble pas valide.\n" +
              "Merci d'entrer un email correct (ex : votre@email.fr)"
            );
            setInputDisabled(false);
          });
          break;
        }
        ETAT.donnees.email = texte.trim();
        ETAT.etape = 7;
        showTyping(function () {
          addMessage("bot",
            "Étape 7/7 — Un message particulier ?\n" +
            "(allergie, occasion spéciale, chaise haute…)"
          );
          showStepButtons(
            ["Non, rien à signaler"],
            function () { traiterEtape("Aucun message particulier"); }
          );
          setInputDisabled(false);
        });
        break;

      case 7: /* Message optionnel */
        ETAT.donnees.message = texte;
        ETAT.etape = 0;
        afficherRecapEtEnvoyer();
        break;
    }
  }

  function afficherRecapEtEnvoyer() {
    var d = ETAT.donnees;
    var nbPersonnes = d.personnes + " personne" + (d.personnes === "1" ? "" : "s");

    var recap =
      "Voici le récapitulatif de votre réservation :\n\n" +
      "👤 " + d.nom       + "\n" +
      "📅 " + d.date      + "\n" +
      "⏰ " + d.heure     + "\n" +
      "👥 " + nbPersonnes + "\n" +
      "📞 " + d.telephone + "\n" +
      "📧 " + d.email     + "\n" +
      (d.message !== "Aucun message particulier" ? "💬 " + d.message + "\n" : "");

    setInputDisabled(true);

    showTyping(function () {
      addMessage("bot", recap);

      var zone    = document.getElementById("ane-chat-messages");
      var loading = document.createElement("div");
      loading.id        = "ane-typing-envoi";
      loading.className = "ane-msg bot";
      loading.innerHTML = '<div class="ane-msg-bubble ane-typing-dots"><span></span><span></span><span></span></div>';
      zone.appendChild(loading);
      zone.scrollTop = zone.scrollHeight;

      envoyerWeb3Forms(d, function (succes) {
        var el = document.getElementById("ane-typing-envoi");
        if (el) { el.parentNode.removeChild(el); }
        addMessage("bot", succes ? REP.confirmationResa : REP.erreurResa);
        terminerReservation();
      });
    });
  }

  function envoyerWeb3Forms(d, callback) {
    fetch("https://api.web3forms.com/submit", {
      method:  "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({
        access_key:   WEB3FORMS_KEY,
        subject:      "Nouvelle réservation (démo) — " + d.nom + " — " + d.date + " à " + d.heure,
        from_name:    "Widget Démo ChatBot Restaurant",
        email:        d.email,
        replyto:      d.email,
        autoresponse: buildAutoresponse(d),
        Nom:          d.nom,
        Date:         d.date,
        Heure:        d.heure,
        Personnes:    d.personnes,
        Téléphone:    d.telephone,
        Email:        d.email,
        Message:      d.message,
      }),
    })
    .then(function (r)    { return r.json(); })
    .then(function (data) { callback(data.success === true); })
    .catch(function ()    { callback(false); });
  }

  function terminerReservation() {
    ETAT.mode  = 'normal';
    ETAT.etape = 0;
    setInputDisabled(false);
    showMainButtons();
  }

  /* ----------------------------------------------------------
     LOGIQUE BOT MODE NORMAL
     ---------------------------------------------------------- */
  function getBotResponse(texte) {
    var t = normalise(texte);
    for (var i = 0; i < REGLES.length; i++) {
      for (var j = 0; j < REGLES[i].mots.length; j++) {
        if (t.indexOf(normalise(REGLES[i].mots[j])) !== -1) {
          if (REGLES[i].rep === null) { demarrerReservation(); return null; }
          return REGLES[i].rep;
        }
      }
    }
    return REP.fallback;
  }

  /* ----------------------------------------------------------
     ENVOI DU MESSAGE TEXTE
     ---------------------------------------------------------- */
  function sendMessage() {
    if (ETAT.enTraitement) { return; }
    var input = document.getElementById("ane-chat-input");
    var texte = input.value.trim();
    if (!texte) { return; }

    addMessage("user", texte);
    input.value = "";
    setInputDisabled(true);

    if (ETAT.mode === 'reservation') {
      traiterEtape(texte);
    } else {
      showTyping(function () {
        var rep = getBotResponse(texte);
        if (rep !== null) {
          addMessage("bot", rep);
          setInputDisabled(false);
        }
        var inp = document.getElementById("ane-chat-input");
        if (inp) { inp.focus(); }
      });
    }
  }

  /* ----------------------------------------------------------
     CLIC SUR UN DES 4 BOUTONS PRINCIPAUX
     ---------------------------------------------------------- */
  function handleButtonClick(action, label) {
    if (ETAT.mode === 'reservation') { return; }
    addMessage("user", label);
    if (action === "reserver") { demarrerReservation(); return; }
    var reponses = { horaires: REP.horaires, menu: REP.menu, adresse: REP.adresse };
    showTyping(function () { addMessage("bot", reponses[action] || REP.fallback); });
  }

  /* ----------------------------------------------------------
     TOOLTIP — masquer avec fade-out
     ---------------------------------------------------------- */
  function hideTooltip() {
    var tip = document.getElementById('ane-tooltip');
    if (!tip) { return; }
    tip.classList.remove('visible');
    tip.classList.add('hiding');
    setTimeout(function () { tip.classList.remove('hiding'); }, 380);
  }

  /* ----------------------------------------------------------
     OUVRIR / FERMER
     ---------------------------------------------------------- */
  function openChat() {
    chatOpenedOnce = true;
    clearTimeout(tipTimer1);
    clearTimeout(tipTimer2);
    hideTooltip();
    document.getElementById("ane-chat-window").classList.add("open");
    document.getElementById("ane-chat-btn").setAttribute("aria-expanded", "true");
    setTimeout(function () {
      var input = document.getElementById("ane-chat-input");
      if (input) { input.focus(); }
    }, 260);
  }

  function closeChat() {
    document.getElementById("ane-chat-window").classList.remove("open");
    document.getElementById("ane-chat-btn").setAttribute("aria-expanded", "false");
  }

  function toggleChat() {
    var win = document.getElementById("ane-chat-window");
    if (win.classList.contains("open")) { closeChat(); } else { openChat(); }
  }

  /* ----------------------------------------------------------
     CONSTRUCTION DU WIDGET
     ---------------------------------------------------------- */
  function buildWidget() {
    var btn = document.createElement("button");
    btn.id = "ane-chat-btn";
    btn.setAttribute("aria-label", "Ouvrir le chat");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML =
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>' +
      "</svg>" +
      '<span class="ane-btn-label">Réserver une table&nbsp;?</span>';

    var win = document.createElement("div");
    win.id = "ane-chat-window";
    win.setAttribute("role", "dialog");
    win.setAttribute("aria-modal", "true");
    win.setAttribute("aria-label", "Chat " + CONFIG.restaurantName);

    win.innerHTML =
      '<div id="ane-chat-header">' +
        '<div id="ane-chat-header-left">' +
          '<div id="ane-chat-avatar">' + CONFIG.avatar + "</div>" +
          "<div>" +
            '<div id="ane-chat-title">' + CONFIG.restaurantName + "</div>" +
            '<div id="ane-chat-subtitle">' + CONFIG.subtitle + "</div>" +
          "</div>" +
        "</div>" +
        '<button id="ane-chat-close" aria-label="Fermer le chat">' +
          '<svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        "</button>" +
      "</div>" +
      '<div id="ane-chat-messages"></div>' +
      '<div id="ane-quick-btns">' +
        '<button class="ane-quick-btn" data-action="horaires">📅 Horaires</button>' +
        '<button class="ane-quick-btn" data-action="menu">🍽️ Menu</button>' +
        '<button class="ane-quick-btn" data-action="adresse">📍 Où nous trouver</button>' +
        '<button class="ane-quick-btn" data-action="reserver">🪑 Réserver</button>' +
      "</div>" +
      '<div id="ane-chat-input-area">' +
        '<input id="ane-chat-input" type="text" placeholder="' + CONFIG.placeholder + '" autocomplete="off" />' +
        '<button id="ane-chat-send" aria-label="Envoyer">' +
          '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>' +
        "</button>" +
      "</div>" +
      '<div id="ane-chat-footer">Propulsé par ' + CONFIG.poweredBy + "</div>";

    document.body.appendChild(btn);
    document.body.appendChild(win);

    /* ---- Tooltip d'appel ------------------------------------------------ */
    var tooltip = document.createElement('div');
    tooltip.id          = 'ane-tooltip';
    tooltip.textContent = "Bonjour ! 👋 Envie de réserver une table ou une question sur notre carte ? Je vous réponds en quelques secondes !";
    document.body.appendChild(tooltip);

    tipTimer1 = setTimeout(function () {
      if (chatOpenedOnce) { return; }
      tooltip.classList.add('visible');
      tipTimer2 = setTimeout(function () { hideTooltip(); }, 5000);
    }, 5000);

    tooltip.addEventListener('click', function (e) {
      e.stopPropagation();
      clearTimeout(tipTimer1);
      clearTimeout(tipTimer2);
      openChat();
    });
    /* --------------------------------------------------------------------- */

    addMessage("bot", CONFIG.welcomeMessage);

    win.querySelectorAll(".ane-quick-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        handleButtonClick(b.getAttribute("data-action"), b.textContent);
      });
    });

    btn.addEventListener("click", toggleChat);

    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && win.classList.contains("open")) {
        e.preventDefault();
        var input = document.getElementById("ane-chat-input");
        if (input) { input.focus(); }
      }
    });

    document.getElementById("ane-chat-close").addEventListener("click", closeChat);
    document.getElementById("ane-chat-send").addEventListener("click", sendMessage);

    document.getElementById("ane-chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        sendMessage();
      }
    });
    document.getElementById("ane-chat-input").addEventListener("keypress", function (e) {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
    });

    win.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") { return; }
      e.preventDefault();
      var t = e.target;
      if (t.classList.contains("ane-step-btn") ||
          t.classList.contains("ane-quick-btn") ||
          t.id === "ane-chat-send") {
        t.click();
      } else if (t.id === "ane-chat-close") {
        closeChat();
      }
    });
    win.addEventListener("keypress", function (e) {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
    });

    document.addEventListener("click", function (e) {
      var path = e.composedPath ? e.composedPath() : [];
      var inWin = path.length ? path.indexOf(win) !== -1 : win.contains(e.target);
      var inBtn = path.length ? path.indexOf(btn) !== -1 : btn.contains(e.target);
      if (win.classList.contains("open") && !inWin && !inBtn) {
        closeChat();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && win.classList.contains("open")) {
        closeChat();
        btn.focus();
      }
    });
  }

  /* ----------------------------------------------------------
     HOOK — Boutons "Réserver" déjà présents sur la page hôte
     ---------------------------------------------------------- */
  function hookReserveButtons() {
    var btns = document.querySelectorAll(".btn-reserve");
    for (var i = 0; i < btns.length; i++) {
      (function (el) {
        el.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          openChat();
          setTimeout(function () { demarrerReservation(); }, 120);
        });
      })(btns[i]);
    }
  }

  /* ----------------------------------------------------------
     DÉMARRAGE — toujours actif sur la page de démo
     ---------------------------------------------------------- */
  function loadCSS() {
    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.type = "text/css";
    link.href = CONFIG.cssPath;
    document.head.appendChild(link);
  }

  function init() { loadCSS(); buildWidget(); hookReserveButtons(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();

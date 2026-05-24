/**
 * Widget Chat — L'Âne Arrosé
 * Inclut le flux de réservation guidé en 6 étapes + envoi Web3Forms.
 */
(function () {
  'use strict';

  /* ----------------------------------------------------------
     CONFIGURATION
     ---------------------------------------------------------- */
  var CONFIG = {
    restaurantName: "L'Âne Arrosé",
    subtitle:       "On vous répond avec plaisir 🐴",
    avatar:         "🐴",
    welcomeMessage: "Bonjour 🐴 Bienvenue à L'Âne Arrosé ! Comment puis-je vous aider ?",
    placeholder:    "Écrivez votre message…",
    cssPath:        "widget.css",
    poweredBy:      "ChatResto",
    delaiReponse:   700,
  };

  /* ----------------------------------------------------------
     WEB3FORMS
     Remplacer VOTRE_CLE_ICI par la clé obtenue sur web3forms.com
     ---------------------------------------------------------- */
  var WEB3FORMS_KEY    = "552cd89a-c288-4ac7-9cb5-e2efcf0ae4ef";
  var RESTAURANT_EMAIL = "contact@lane-arrose.fr";

  /* ----------------------------------------------------------
     RÉPONSES — données du brief
     ---------------------------------------------------------- */
  var REP = {
    horaires:
      "Voici nos horaires :\n\n" +
      "• Lundi : fermé\n" +
      "• Mardi : midi 12h–14h (soir fermé)\n" +
      "• Mercredi–Jeudi : midi 12h–14h / soir 19h–22h\n" +
      "• Vendredi : midi 12h–14h / soir 19h–22h30\n" +
      "• Samedi : midi 12h–14h30 / soir 19h–22h30\n" +
      "• Dimanche : midi 12h–14h30 (soir fermé)\n\n" +
      "Fermeture annuelle : premières semaines d'août et entre Noël et Nouvel An.\n" +
      "La réservation est conseillée le week-end !",

    menu:
      "Notre cuisine est généreuse et ancrée dans le terroir poitevin 🍽️\n\n" +
      "Entrées (8–12€)\n" +
      "Œufs mimosa maison, terrine de campagne, salade poitevine (mogettes, jambon, œuf), chèvre chaud au miel…\n\n" +
      "Plats (14–22€)\n" +
      "Steak frites sauce poivre, magret de canard, joue de bœuf braisée, filet de bar, poulet rôti fermier, mogettes au beurre (végétarien)…\n\n" +
      "Desserts (6–8€)\n" +
      "Tarte Tatin maison, crème brûlée, fondant au chocolat, île flottante…\n\n" +
      "Menu du jour : 18€ (entrée + plat + dessert) — ardoise annoncée chaque matin sur Facebook.\n" +
      "Menu midi semaine : 15€ (plat + café)\n" +
      "Menu enfant (–12 ans) : 10€",

    adresse:
      "Vous nous trouverez au cœur du village 📍\n\n" +
      "12 Place de l'Église\n" +
      "79210 Saint-Georges-de-Rex\n\n" +
      "Parking gratuit juste devant le restaurant.\n" +
      "La place du village est à 50 mètres si besoin.",

    prix:
      "Voici notre gamme de prix :\n\n" +
      "• Entrées : 8–12€\n" +
      "• Plats : 14–22€\n" +
      "• Desserts : 6–8€\n" +
      "• Menu du jour : 18€ (entrée + plat + dessert)\n" +
      "• Menu midi semaine : 15€ (plat + café)\n" +
      "• Vin au verre à partir de 4€\n\n" +
      "Une table vous ferait plaisir ?",

    enfants:
      "Les enfants sont les bienvenus ! 🐴\n\n" +
      "Des chaises hautes sont disponibles sur demande.\n" +
      "Menu enfant à 10€ pour les moins de 12 ans : petit plat + boisson + dessert.",

    parking:
      "Pas de souci pour vous garer !\n\n" +
      "Parking gratuit juste devant le restaurant.\n" +
      "La place du village est à 50 mètres si besoin.",

    terrasse:
      "Oui, nous avons une belle terrasse ombragée !\n\n" +
      "Elle accueille une vingtaine de personnes et est ouverte d'avril à octobre, selon la météo.\n" +
      "Les chiens y sont acceptés, tenus en laisse 🌿",

    regimes:
      "Nous nous adaptons à vos besoins !\n\n" +
      "Des plats végétariens sont proposés à la carte : mogettes au beurre, risotto aux cèpes (en saison)…\n\n" +
      "Pour toute allergie (gluten, lactose…), merci de nous le signaler à la réservation : notre cuisine s'adapte avec plaisir.",

    animaux:
      "Votre compagnon est le bienvenu… en terrasse ! 🐾\n\n" +
      "Les chiens sont acceptés en terrasse, tenus en laisse.\n" +
      "En salle, nous ne pouvons malheureusement pas les accueillir.",

    fallback:
      "Je n'ai pas bien compris votre question 😅 Voici ce que je peux vous aider à faire :",

    confirmationResa:
      "Votre réservation est confirmée ! Un email récapitulatif vous a été envoyé. À très bientôt à L'Âne Arrosé 🐴",

    erreurResa:
      "Une erreur s'est produite lors de l'envoi 😕\n\n" +
      "Appelez-nous directement au 05 49 XX XX XX, nous nous occupons de vous.",
  };

  /* Surcharge REP depuis localStorage si le restaurateur a modifié */
  (function () {
    try { var h = localStorage.getItem('ane_horaires'); if (h) { REP.horaires = buildHorairesText(JSON.parse(h)); } } catch (e) {}
    try { var m = localStorage.getItem('ane_menu');     if (m) { REP.menu     = buildMenuText(JSON.parse(m));     } } catch (e) {}
  })();

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
    mode:          'normal',     /* 'normal' | 'reservation' */
    etape:         0,            /* 1 à 7 */
    enTraitement:  false,        /* true pendant le délai bot → bloque double-envoi */
    dateEnAttente: null,         /* date naturelle proposée, en attente de confirmation client */
    donnees:       { nom: '', date: '', heure: '', personnes: '', telephone: '', email: '', message: '' },
  };

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

  /* Fix bug "Entrée ferme le chat" :
     L'input n'est JAMAIS disabled (le focus resterait sur le bouton flottant).
     Seul le bouton Envoyer est visuellement désactivé.
     ETAT.enTraitement bloque les doubles envois. */
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
     Pour les choix : heure, nombre de personnes, "Non rien"
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
      /* CORRECTION BUG : après suppression du bouton d'étape, le focus
         partait sur #ane-chat-btn → Entrée suivant fermait le chat.
         On remet le focus sur l'input immédiatement. */
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

  /* Renvoie { ok: true, valeur } ou { ok: false, type: 'format'|'passe' } */
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

  /* ----------------------------------------------------------
     CONSTRUCTION DES RÉPONSES DEPUIS localStorage ADMIN
     ---------------------------------------------------------- */
  function buildHorairesText(h) {
    var cles = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche'];
    var noms = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'];
    var txt  = "Voici nos horaires :\n\n";
    cles.forEach(function (cle, i) {
      var d = h[cle]; if (!d) { return; }
      var midiStr = d.midi && d.midi.ouvert ? 'midi ' + d.midi.debut + '–' + d.midi.fin : '';
      var soirStr = d.soir && d.soir.ouvert ? 'soir ' + d.soir.debut + '–' + d.soir.fin : '';
      var horaire;
      if (midiStr && soirStr) { horaire = midiStr + ' / ' + soirStr; }
      else if (midiStr)       { horaire = midiStr + ' (soir fermé)'; }
      else if (soirStr)       { horaire = '(midi fermé) ' + soirStr; }
      else                    { horaire = 'fermé'; }
      txt += '• ' + noms[i] + ' : ' + horaire + '\n';
    });
    return txt +
      "\nFermeture annuelle : premières semaines d'août et entre Noël et Nouvel An.\n" +
      "La réservation est conseillée le week-end !";
  }

  function buildMenuText(m) {
    function section(titre, items) {
      if (!items || !items.length) { return ''; }
      var s = titre + '\n';
      items.forEach(function (p) { s += '• ' + p.nom + (p.prix ? ' (' + p.prix + ')' : '') + '\n'; });
      return s + '\n';
    }
    return "Notre cuisine est généreuse et ancrée dans le terroir poitevin 🍽️\n\n" +
      section('Entrées',  m.entrees)  +
      section('Plats',    m.plats)    +
      section('Desserts', m.desserts) +
      "Menu du jour : 18€ (entrée + plat + dessert) — ardoise annoncée chaque matin sur Facebook.\n" +
      "Menu midi semaine : 15€ (plat + café)\n" +
      "Menu enfant (–12 ans) : 10€";
  }

  /* Validation email basique */
  function validerEmail(texte) {
    var e = texte.trim();
    return e.indexOf('@') > 0 && e.lastIndexOf('.') > e.indexOf('@') + 1 && e.length >= 6;
  }

  /* ----------------------------------------------------------
     RECONNAISSANCE DE DATE EN LANGAGE NATUREL
     ---------------------------------------------------------- */

  /* Retourne la date au format JJ/MM/AAAA si le texte est reconnu, sinon null */
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

  /* Retourne true si le texte exprime une confirmation (oui, ok…) */
  function estConfirmation(texte) {
    return /^(oui|ok|yes|ouais|parfait|correct|exactement|tout a fait|c est (ca|bon)|affirmatif)/.test(
      normalise(texte.trim())
    );
  }

  /* Retourne true si le texte exprime un refus (non, changer…) */
  function estRefus(texte) {
    return /^(non|no|nope|pas ca|changer|incorrect)/.test(
      normalise(texte.trim())
    );
  }

  /* Email de confirmation envoyé au client */
  function buildAutoresponse(d) {
    var nb = d.personnes + " personne" + (d.personnes === "1" ? "" : "s");
    return "Bonjour " + d.nom + ",\n\n" +
      "Votre réservation à L'Âne Arrosé est bien enregistrée.\n\n" +
      "Récapitulatif :\n" +
      "• Date : " + d.date + "\n" +
      "• Heure : " + d.heure + "\n" +
      "• Personnes : " + nb + "\n" +
      "• Téléphone : " + d.telephone + "\n" +
      (d.message !== "Aucun message particulier" ? "• Message : " + d.message + "\n" : "") +
      "\nÀ très bientôt à L'Âne Arrosé !\n\n" +
      "L'équipe de L'Âne Arrosé\n" +
      "12 Place de l'Église, 79210 Saint-Georges-de-Rex\n" +
      "05 49 XX XX XX";
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

        /* ---- Sous-état : on attend oui/non pour une date naturelle ---- */
        if (ETAT.dateEnAttente) {
          if (estConfirmation(texte)) {
            /* Confirmé → enregistrer et avancer */
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
            /* Refusé → reposer la question */
            ETAT.dateEnAttente = null;
            showTyping(function () {
              addMessage("bot",
                "Pas de problème ! Quelle date préférez-vous ?\n" +
                "(JJ/MM/AAAA ou : demain, après-demain, dans 3 jours, dans 4 jours)"
              );
              setInputDisabled(false);
            });
          } else {
            /* Réponse ambiguë → reproposer avec boutons */
            var dateProposee = ETAT.dateEnAttente;
            showTyping(function () {
              addMessage("bot", "Je confirme bien le " + dateProposee + " ?");
              showStepButtons(["Oui", "Non"], function (val) { traiterEtape(val); });
              setInputDisabled(false);
            });
          }
          break;
        }

        /* ---- Détecter une expression naturelle ---- */
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

        /* ---- Validation format JJ/MM/AAAA ---- */
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
            setInputDisabled(false); /* reste à l'étape 6 */
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
        if (succes) { sauvegarderReservation(d); }
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
        subject:      "Nouvelle réservation — " + d.nom + " — " + d.date + " à " + d.heure,
        from_name:    "Widget L'Âne Arrosé",
        email:        d.email,           /* déclenche l'autoresponse vers le client */
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

  function sauvegarderReservation(d) {
    var cle   = 'ane_reservations';
    var liste = [];
    try {
      var raw = localStorage.getItem(cle);
      if (raw) { liste = JSON.parse(raw); }
    } catch (e) {}
    liste.unshift({
      id:        Date.now(),
      recu_le:   new Date().toLocaleString('fr-FR'),
      nom:       d.nom,
      date:      d.date,
      heure:     d.heure,
      personnes: d.personnes,
      telephone: d.telephone,
      email:     d.email,
      message:   d.message,
    });
    try { localStorage.setItem(cle, JSON.stringify(liste)); } catch (e) {}
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
    if (ETAT.enTraitement) { return; }   /* bot encore en train de répondre */
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
     OUVRIR / FERMER
     ---------------------------------------------------------- */
  function openChat() {
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
      '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/>' +
      "</svg>";

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

    addMessage("bot", CONFIG.welcomeMessage);

    win.querySelectorAll(".ane-quick-btn").forEach(function (b) {
      b.addEventListener("click", function () {
        handleButtonClick(b.getAttribute("data-action"), b.textContent);
      });
    });

    btn.addEventListener("click", toggleChat);

    /* CORRECTION : si le focus atterrit sur le bouton flottant pendant
       que le chat est ouvert (ex. après suppression d'un bouton d'étape),
       Entrée ne doit PAS fermer le chat — on remet le focus sur l'input. */
    btn.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && win.classList.contains("open")) {
        e.preventDefault();
        var input = document.getElementById("ane-chat-input");
        if (input) { input.focus(); }
      }
    });

    document.getElementById("ane-chat-close").addEventListener("click", closeChat);
    document.getElementById("ane-chat-send").addEventListener("click", sendMessage);

    /* Input — keydown : preventDefault + stopPropagation + sendMessage */
    document.getElementById("ane-chat-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();   /* empêche tout comportement par défaut */
        e.stopPropagation();  /* empêche la remontée vers win / document */
        sendMessage();
      }
    });
    /* Input — keypress : ceinture et bretelles */
    document.getElementById("ane-chat-input").addEventListener("keypress", function (e) {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
    });

    /* Intercepte TOUS les Enter qui remontent jusqu'à la fenêtre de chat.
       L'input appelle stopPropagation donc cet handler ne le voit PAS.
       Pour les boutons internes (étapes, actions rapides, envoyer) :
       - on bloque le clic synthétique natif du navigateur (preventDefault)
       - on déclenche le clic manuellement pour rester maître du flux. */
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
    /* Keypress au niveau de la fenêtre — bloque tout résidu */
    win.addEventListener("keypress", function (e) {
      if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); }
    });

    document.addEventListener("click", function (e) {
      /* CORRECTION RACINE : un bouton d'étape (.ane-step-btn) se supprime
         lui-même du DOM pendant son gestionnaire de clic. Après suppression,
         win.contains(e.target) renvoie false → closeChat() se déclenchait
         par erreur sur TOUS les clics de boutons d'étape (souris ET clavier).
         e.composedPath() capture le chemin DOM au moment de la dispatchEvent,
         avant toute suppression, et retourne donc bien win dans le chemin. */
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
     DÉMARRAGE
     ---------------------------------------------------------- */
  function loadCSS() {
    var link = document.createElement("link");
    link.rel  = "stylesheet";
    link.type = "text/css";
    link.href = CONFIG.cssPath;
    document.head.appendChild(link);
  }

  function init() { loadCSS(); buildWidget(); }

  if (localStorage.getItem('ane_actif') === '0') { return; }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();

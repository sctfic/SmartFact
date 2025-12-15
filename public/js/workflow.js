function workflow(id, status, options = {}) {
    console.log('workflow', id, status);
    // Configuration des étapes du workflow avec icônes
    const steps = [
        { id: 0, label: 'Brouillon', short: 'BR', hasEmail: true, hasCheckbox: false },
        { id: 1, label: 'Envoyé', short: 'EN', hasEmail: false, hasCheckbox: true }, // Checkbox -> Gagné
        { id: 3, label: 'Gagné', short: 'GA', hasEmail: false, hasCheckbox: false },
        { id: 4, label: 'Effectué', short: 'EF', hasEmail: true, hasCheckbox: false },
        { id: 6, label: 'À Payer', short: 'AP', hasEmail: false, hasCheckbox: true }, // Checkbox -> Payée
        { id: 9, label: 'Payée', short: 'OK', hasEmail: false, hasCheckbox: false }
    ];

    // Options de callback
    const onCheckboxChange = options.onCheckboxChange || ((checked, status) => {
        console.log('Checkbox verification requested', checked, status);
    });
    const onEmailClick = options.onEmailClick || ((status) => console.log('Email', status));

    // Vérification des dates
    const date = options.date ? new Date(options.date) : new Date();
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Logique de transformation d'état basée sur les dates (Alerte uniquement ou transformation visuelle)
    // Si on est "Envoyé" (1) depuis > 30 jours, on propose "Perdu" (2)
    let effectiveStatus = status;
    if (status === 1 && diffDays > 30) {
        // On considère visuellement comme 'Perdu' (2) pour inciter à l'action ou montrer l'état critique
        effectiveStatus = 2; // Perdu
    }
    // Si on est "Gagné" (3) depuis > 30 jours (largement dépassé), on passe à "Effectué" (4)
    if (status === 3 && diffDays > 0) {
        effectiveStatus = 4; // Effectué
    }
    // Si on est "À Payer" (6) depuis > 21 jours, on passe à "Relancer" (7)
    if (status === 6 && diffDays > 21) {
        effectiveStatus = 7; // Relancer
    }

    // Gérer les états spéciaux pour la liste des étapes
    let currentSteps = [...steps];

    if (effectiveStatus === 2) {
        currentSteps = currentSteps.map(s =>
            s.id === 3 ? { id: 2, label: 'Perdu', short: 'XX', hasEmail: false, hasCheckbox: false } : s
        );
    } else if (effectiveStatus === 7) {  // si on est "Relancer" (7), on affiche "Relancer!" (7)
        currentSteps = currentSteps.map(s =>
            s.id === 6 ? { id: 7, label: 'Relancer!', short: 'RL', hasEmail: false, hasCheckbox: true } : s
        );
    }

    // Fix: Si on est "Payée" (9), l'étape précédente "À Payer" (6) ne doit pas afficher d'email (pour éviter le flash)
    // if (status === 9) {
    //     console.log('Payée', currentSteps);
    //     currentSteps = currentSteps.map(s =>
    //         s.id === 6 ? { ...s, hasEmail: false } : s
    //     );
    // }

    // Déterminer l'index de l'étape actuelle
    const currentIndex = currentSteps.findIndex(s => s.id === effectiveStatus);

    // Dimensions
    const width = 280;
    const height = 50;
    const stepWidth = 30;
    const stepHeight = 30;
    const baseSpacing = 10;
    const iconSpacing = 20;
    const startX = 10;
    const startY = 10;

    // Créer le conteneur
    const container = document.getElementById(id);
    if (!container) return;

    container.style.position = 'relative';
    container.style.width = width + 'px';
    container.style.height = height + 'px';

    // Fonction pour générer le SVG
    function render() {
        let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

        // Ajout styles animation - Suppression animation sur checkbox elle-même
        // Modification pulse pour couleur bordure
        svg += `
      <defs>
        <style>
          .step-box { cursor: pointer; transition: transform 0.2s; }
          .step-text { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; pointer-events: none; }
          .interactive-icon { cursor: pointer; }
          .interactive-icon:hover { opacity: 0.8; }
          
          /* Animation uniquement pour l'étape suivante : variation couleur bordure */
          @keyframes pulse-border {
             0% { stroke: #9e9e9e; stroke-width: 1px; }
             50% { stroke: #2196f3; stroke-width: 2px; }
             100% { stroke: #9e9e9e; stroke-width: 1px; }
          }
          .next-step-anim rect {
             animation: pulse-border 1.5s infinite;
          }
        </style>
      </defs>
    `;

        // Dessiner les étapes
        currentSteps.forEach((step, index) => {
            let cumulativeX = startX;
            for (let i = 0; i < index; i++) {
                cumulativeX += stepWidth;
                const prevStep = currentSteps[i];

                // Calculer l'espacement requis par cette étape précédente
                const needsSpace = (prevStep.hasEmail || prevStep.hasCheckbox);
                cumulativeX += needsSpace ? iconSpacing : baseSpacing;
            }

            const x = cumulativeX;
            const y = startY;

            let fillColor, strokeColor, strokeWidth;

            if (step.id === effectiveStatus) {
                if (effectiveStatus === 2) { // Perdu
                    fillColor = '#ef5350'; strokeColor = '#c62828';
                } else if (effectiveStatus === 7) { // Relancer
                    fillColor = '#ff9800'; strokeColor = '#e65100';
                } else {
                    fillColor = '#2196f3'; strokeColor = '#1565c0';
                }
                strokeWidth = 3;
            } else if (index < currentIndex) {
                // Étapes passées
                fillColor = '#4caf50'; strokeColor = '#2e7d32'; strokeWidth = 1;
            } else {
                // Étapes futures
                fillColor = '#e0e0e0'; strokeColor = '#9e9e9e'; strokeWidth = 1;
            }

            // Ajout ID unique pour animation
            const boxId = `${id}-step-${step.id}`;

            svg += `<g class="step-box" id="${boxId}" data-step-id="${step.id}" data-step-label="${step.label}">`;
            svg += `
        <rect x="${x}" y="${y}" width="${stepWidth}" height="${stepHeight}" 
              rx="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
      `;
            svg += `
        <text x="${x + stepWidth / 2}" y="${y + stepHeight / 2 + 3}" 
              text-anchor="middle" class="step-text" fill="white">
          ${step.short}
        </text>
      `;
            svg += `</g>`;

            // Gestion des contrôles interactifs (Checkbox / Email)
            if (index <= currentIndex) {
                const connectorX = x + stepWidth;

                // DESSINER LE CONNECTEUR D'ABORD (pour qu'il soit derrière la checkbox)
                if (index < currentSteps.length - 1) {
                    const spacing = (step.hasEmail || step.hasCheckbox) ? iconSpacing : baseSpacing;
                    const lineColor = (index < currentIndex) ? '#4caf50' : '#bdbdbd';
                    svg += `
              <line x1="${connectorX}" y1="${y + stepHeight / 2}" 
                    x2="${connectorX + spacing}" y2="${y + stepHeight / 2}" 
                    stroke="${lineColor}" stroke-width="2" />
            `;
                }

                let isChecked = (index < currentIndex);
                if (effectiveStatus === 2 && step.id === 1) isChecked = false;

                // Tooltips
                let checkboxTooltip = "Marquer comme fait";
                if (step.id === 1) checkboxTooltip = isChecked ? "Devis refusé ou en attente" : "Devis validé";
                if (step.id === 6 || step.id === 7) checkboxTooltip = isChecked ? "en attente de paiement" : "Facture payée";

                let emailTooltip = step.id === 0 ? "deja envoyé" : "Envoyer maintenant";

                // Afficher Checkbox
                let showCheckbox = step.hasCheckbox;
                // Règle: Si on est à l'étape 'Effectué' (4) ou plus, on ne peut plus décocher 'Envoyé' (1/Gagné)
                // La checkbox devient invisible ou non interactive. La demande est "sinon elle devient hiden".
                // Effectué = status 4. 
                if (step.id === 1 && status >= 4) {
                    showCheckbox = false;
                }

                if (showCheckbox) {
                    const checkColor = isChecked ? '#4caf50' : '#666';
                    const actionClass = isChecked ? 'action-uncheck' : 'action-check';

                    // Position modifiée: sur le connecteur (milieu vertical) -> descendue de 5px
                    // Origine: y + stepHeight/2 - 6
                    // Nouvelle: y + stepHeight/2 - 6 + 5 = y + stepHeight/2 - 1
                    const checkboxY = y + stepHeight / 2 - 1;

                    // Target pour l'animation (étape suivante)
                    // Pour step 1 (Envoyé), target est 3 (Gagné)
                    // Pour step 6 (À Payer), target est 9 (Payée)
                    let targetStepIdForAnim = -1;
                    if (step.id === 1) targetStepIdForAnim = 3;
                    if (step.id === 6 || step.id === 7) targetStepIdForAnim = 9;

                    svg += `
            <g class="interactive-icon checkbox-icon ${actionClass}" 
               data-target-step="${step.id}" 
               data-tooltip="${checkboxTooltip}"
               data-next-anim="${targetStepIdForAnim !== -1 ? `${id}-step-${targetStepIdForAnim}` : ''}">
              <rect x="${connectorX + 4}" y="${checkboxY - 5}" width="12" height="12" 
                    rx="2" fill="white" stroke="#333" stroke-width="1.5"/>
              ${isChecked ? `<path d="M ${connectorX + 6} ${checkboxY + 1} l 3 3 l 5 -6" 
                    stroke="${checkColor}" stroke-width="2" fill="none" stroke-linecap="round"/>` : ''}
            </g>
          `;
                }

                // Afficher Email
                if (step.hasEmail) {
                    const isEmailSent = (index < currentIndex);

                    // Position modifiée: remontée de 5px supplémentaires
                    const emailY = y + stepHeight - 7;

                    // Décalage spécifique pour l'étape 4 (Effectué)
                    const shiftX = (step.id === 4) ? 0 : 0;

                    // Style modifié: Enveloppe noire/grise fixe, check vert
                    const envelopeStroke = '#555';

                    svg += `
            <g class="interactive-icon email-icon" data-target-step="${step.id}" data-tooltip="${emailTooltip}">
              <rect x="${connectorX + 2 + shiftX}" y="${emailY}" width="14" height="10" 
                    rx="1" fill="white" stroke="${envelopeStroke}" stroke-width="1.5"/>
              <path d="M ${connectorX + 2 + shiftX} ${emailY} l 7 5 l 7 -5" 
                    stroke="${envelopeStroke}" stroke-width="1.5" fill="none" stroke-linejoin="round"/>
              ${isEmailSent ? `
                <circle cx="${connectorX + 16 + shiftX}" cy="${emailY + 10}" r="5" fill="#4caf50"/>
                <path d="M ${connectorX + 14 + shiftX} ${emailY + 10} l 1.5 1.5 l 3.5 -3.5" 
                      stroke="white" stroke-width="1.5" fill="none" stroke-linecap="round"/>
              ` : ''}
            </g>
          `;
                }
            }
        });

        svg += `</svg>`;
        return svg;
    }

    // Premier rendu
    container.innerHTML = render();

    // Tooltip
    let tooltip = container.querySelector('.workflow-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'workflow-tooltip';
        tooltip.style.cssText = `
      position: absolute;
      background: rgba(0,0,0,0.9);
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    `;
        container.appendChild(tooltip);
    }

    function showTooltip(element, text) {
        tooltip.textContent = text;
        tooltip.style.opacity = '1';
        const rect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const left = rect.left - containerRect.left + rect.width / 2 - tooltip.offsetWidth / 2;
        const top = rect.top - containerRect.top - tooltip.offsetHeight - 5;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    // Attacher les événements
    function attachEvents() {
        const stepBoxes = container.querySelectorAll('.step-box');
        stepBoxes.forEach(box => {
            box.addEventListener('mouseenter', () => {
                showTooltip(box, `${box.dataset.stepId} - ${box.dataset.stepLabel}`);
            });
            box.addEventListener('mouseleave', () => tooltip.style.opacity = '0');

            // Clic sur l'étape 7 (Relancer) renvoie la facture
            box.addEventListener('click', (e) => {
                const sId = parseInt(box.dataset.stepId);
                if (sId === 7) {
                    console.log(`[Workflow] Relance facture via étape 7`);
                    onEmailClick(sId);
                }
            });
        });

        // Checkboxes
        const checkboxes = container.querySelectorAll('.checkbox-icon');
        checkboxes.forEach(cb => {
            cb.addEventListener('mouseenter', () => {
                const t = cb.getAttribute('data-tooltip');
                if (t) showTooltip(cb, t);

                // Animation sur l'étape suivante
                const animTargetId = cb.getAttribute('data-next-anim');
                if (animTargetId) {
                    const target = document.getElementById(animTargetId);
                    if (target) target.classList.add('next-step-anim');
                }
            });

            cb.addEventListener('mouseleave', () => {
                tooltip.style.opacity = '0';
                // Stop animation
                const animTargetId = cb.getAttribute('data-next-anim');
                if (animTargetId) {
                    const target = document.getElementById(animTargetId);
                    if (target) target.classList.remove('next-step-anim');
                }
            });

            cb.addEventListener('click', (e) => {
                e.stopPropagation();
                const stepId = parseInt(cb.getAttribute('data-target-step'));
                const isUncheckAction = cb.classList.contains('action-uncheck');

                // Validation simple de la date pour le log (exemple)
                if (!isUncheckAction) {
                    const isValidDate = (now >= date);
                    if (!isValidDate) {
                        console.warn(`[Workflow] Attention: Validation pour étape ${stepId} alors que la date est future ?`, date);
                    } else {
                        console.log(`[Workflow] Validation étape ${stepId} - Date OK`);
                    }
                }

                onCheckboxChange(!isUncheckAction, stepId);
            });
        });

        // Emails
        const emails = container.querySelectorAll('.email-icon');
        emails.forEach(em => {
            em.addEventListener('mouseenter', () => {
                const t = em.getAttribute('data-tooltip');
                if (t) showTooltip(em, t);
            });
            em.addEventListener('mouseleave', () => tooltip.style.opacity = '0');

            em.addEventListener('click', (e) => {
                e.stopPropagation();
                const stepId = parseInt(em.getAttribute('data-target-step'));
                console.log(`[Workflow] Envoi email pour étape ${stepId}`);
                onEmailClick(stepId);
            });
        });
    }

    attachEvents();
}

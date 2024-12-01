document.getElementById("generateEdges").addEventListener("click", function () {
  const n = parseInt(document.getElementById("nodes").value);
  const edgesContainer = document.getElementById("edges-container");
  edgesContainer.innerHTML = ""; // Clear previous edges

  // Générer les champs pour chaque arête
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const edgeLabel = `Coût de l'arête (${i}-${j}) :`;
      const inputField = document.createElement("input");
      inputField.type = "number";
      inputField.id = `edge-${i}-${j}`;
      inputField.placeholder = edgeLabel;
      edgesContainer.appendChild(document.createTextNode(edgeLabel));
      edgesContainer.appendChild(inputField);
      edgesContainer.appendChild(document.createElement("br"));
    }
  }
});

document.getElementById("graph-form").addEventListener("submit", function (e) {
  e.preventDefault(); // Prevent the form from submitting

  const n = parseInt(document.getElementById("nodes").value);
  const edges = [];

  // Récupérer les coûts des arêtes
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const cost = parseInt(document.getElementById(`edge-${i}-${j}`).value);
      if (cost) {
        edges.push({ sommet1: i, sommet2: j, cout: cost });
      }
    }
  }

  // Enregistrer l'heure de début
  const startTime = performance.now();

  // Appeler la fonction PVC glouton
  const result = pvcGlouton(n, edges);

  // Enregistrer l'heure de fin
  const endTime = performance.now();

  // Calculer le temps d'exécution
  const executionTime = ((endTime - startTime) / 1000).toFixed(3); // Temps en secondes

  // Afficher les résultats
  const resultsContainer = document.getElementById("results");
  if (result.error) {
    resultsContainer.innerHTML = `<p class="error">${result.error}</p>`;
  } else {
    let cycleStr = "";
    result.cycle.forEach((edge) => {
      cycleStr += `(${edge.sommet1}-${edge.sommet2}), `;
    });
    resultsContainer.innerHTML = `
            <p><strong>Cycle Hamiltonien : </strong>${cycleStr.slice(0, -2)}</p>
            <p><strong>Coût total : </strong>${result.cout}</p>
          `;
  }

  // Afficher le temps d'exécution
  document.getElementById(
    "time"
  ).innerText = `Temps d'exécution: ${executionTime} secondes`;
});

// Fonction pour vérifier si l'ajout d'une arête forme un cycle
function formeCycle(graphe, sommet1, sommet2) {
  // Utilisation de DFS pour vérifier la présence d'un cycle
  const visited = Array(graphe.length).fill(false);

  function dfs(sommet, parent) {
    visited[sommet] = true;
    for (const voisin of graphe[sommet]) {
      if (!visited[voisin]) {
        if (dfs(voisin, sommet)) return true;
      } else if (voisin !== parent) {
        return true; // Un cycle est détecté
      }
    }
    return false;
  }

  // Ajout temporaire de l'arête pour vérifier si elle forme un cycle
  graphe[sommet1].push(sommet2);
  graphe[sommet2].push(sommet1);

  const cycleForme = dfs(sommet1, -1);

  // Retirer l'arête après vérification
  graphe[sommet1].pop();
  graphe[sommet2].pop();

  return cycleForme;
}

// Algorithme glouton pour le PVC
function pvcGlouton(n, edges) {
  const sortedEdges = edges.sort((a, b) => a.cout - b.cout); // Trie les arêtes par coût croissant
  const result = []; // Résultat pour le cycle Hamiltonien
  const degrees = Array(n + 1).fill(0); // Tableau pour suivre les degrés des sommets
  const graphe = Array.from({ length: n + 1 }, () => []); // Représentation du graphe
  let coutTotal = 0;

  // Tableau pour suivre les sommets visités dans l'ordre
  const visited = Array(n + 1).fill(false);
  let visitedCount = 0;

  // Premier sommet choisi
  let currentSommet = 1;

  // Ajouter le premier sommet dans le cycle
  visited[currentSommet] = true;
  visitedCount++;

  // Ajouter les arêtes une à une
  while (visitedCount < n) {
    for (const { sommet1, sommet2, cout } of sortedEdges) {
      // Vérifier si cette arête relie un sommet non encore visité
      if (
        (sommet1 === currentSommet && !visited[sommet2]) ||
        (sommet2 === currentSommet && !visited[sommet1])
      ) {
        // Ajouter l'arête au cycle si elle ne forme pas un cycle
        if (
          degrees[sommet1] < 2 &&
          degrees[sommet2] < 2 &&
          !formeCycle(graphe, sommet1, sommet2)
        ) {
          // Ajouter l'arête au graphe et mettre à jour les degrés des sommets
          graphe[sommet1].push(sommet2);
          graphe[sommet2].push(sommet1);
          result.push({ sommet1, sommet2 });
          coutTotal += cout;

          degrees[sommet1]++;
          degrees[sommet2]++;
          visited[sommet1] = true;
          visited[sommet2] = true;
          visitedCount++;

          // Passer au sommet suivant
          currentSommet = sommet1 === currentSommet ? sommet2 : sommet1;
          break;
        }
      }
    }
  }

  // Ajouter l'arête de retour au premier sommet pour fermer le cycle
  const premierSommet = result[0].sommet1;
  const dernierSommet = result[result.length - 1].sommet2;

  // Trouver l'arête qui ferme le cycle
  const lastEdge = edges.find(
    (edge) =>
      (edge.sommet1 === dernierSommet && edge.sommet2 === premierSommet) ||
      (edge.sommet1 === premierSommet && edge.sommet2 === dernierSommet)
  );

  result.push({ sommet1: dernierSommet, sommet2: premierSommet });
  coutTotal += lastEdge.cout;

  return { cycle: result, cout: coutTotal };
}

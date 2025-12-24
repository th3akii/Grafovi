# Grafovi
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://img.shields.io/netlify/01f9121c-f21a-41d1-92a1-465eee06aff4?style=flat-square&label=Netlify&logo=netlify)](https://grafovi.netlify.app/)

C#/JavaScript projekat za vizualizaciju i algoritme nad grafovima.


## Sadržaj
- [Osobine](#osobine)
- [Uputstvo za instalaciju i podešavanje](#uputstvo-za-instalaciju-i-podešavanje)
- [Struktura projekta](#struktura-projekta)
- [Implementirani algoritmi](#implementirani-algoritmi)
- [Važne C# klase](#važne-c-klase)


## Osobine

### Interaktivna Vizualizacija
* **Iscrtavanje grafova** - Vizualizacija grafova koristeći Vis.js biblioteku
* **Prilagodljiv prikaz** - Mogućnost promene boja čvorova, grana i veličine čvorova
* **Zaključavanje pozicija** - Opcija zaključavanja/otključavanja pomeranja čvorova
* **Drag & Drop** - Mogućnost pomeranja čvorova na canvas-u
* **Podešavanja vizualizacije** - Kompletna kontrola nad prikazom grafa

### Tipovi Grafova
* **Težinski/Netežinski grafovi** - Podrška za grafove sa i bez težina
* **Usmereni/Neusmereni grafovi** - Podrška za oba tipa grafova
* **Dinamičko editovanje** - Dodavanje/brisanje čvorova i grana u realnom vremenu
* **Ažuriranje težina** - Promena težina grana direktno iz interfejsa

### Algoritmi
* **Provera povezanosti** - Pronalaženje komponenti povezanosti grafa
* **Dajkstra (Dijkstra)** - Pronalaženje najkraćeg puta između dva čvora
* **Kruskal** - Pronalaženje minimalnog razapinjućeg stabla
* **Prim** - Alternativni algoritam za minimalno razapinjuće stablo
* **Belman-Ford (Bellman-Ford)** - Najkraći put sa detekcijom negativnih ciklusa

### Uvoz/Izvoz
* **JSON Export** - Čuvanje trenutnog stanja grafa
* **JSON Import** - Učitavanje prethodno sačuvanih grafova


## Uputstvo za instalaciju i podešavanje

### Preduslovi
- [.NET 9.0 SDK](https://dotnet.microsoft.com/download) ili noviji

### Instalacija

1.  **Klonirajte repozitorijum:**

    ```bash
    git clone https://github.com/th3akii/Grafovi.git
    cd Grafovi
    ```

2.  **Povucite zavisnosti (Restore):**

    ```bash
    dotnet restore
    ```

3.  **Izgradite projekat (Build):**

    ```bash
    dotnet build
    ```

4.  **Pokrenite projekat:**

    ```bash
    dotnet run --project Grafovi
    ```

    Blazor aplikacija će biti dostupna na `http://localhost:5000` (ili portalu koji se prikaže u konzoli).

### Alternativno - pokretanje iz Visual Studio
1. Otvorite `Grafovi.sln` u Visual Studio
2. Pritisnite `F5` ili kliknite na **Run** dugme


## Struktura projekta
```
Grafovi/
├── wwwroot/
│   ├── app.js              # JavaScript logika za Vis.js vizualizaciju
│   ├── graph.css           # Stilovi za prikaz grafova
│   ├── index.html          # Glavni HTML fajl
│   └── css/
│       ├── app.css         # Glavni stilovi aplikacije
│       └── theme.css       # Tema aplikacije
├── Components/
│   ├── Pages/
│   │   └── Home.razor      # Glavna stranica sa interfejsom
│   └── Layout/
│       └── MainLayout.razor # Layout aplikacije
├── Models/
│   ├── Graf.cs
│   ├── GrafCvor.cs
│   ├── GrafGrana.cs
│   ├── Algoritmi/
│   │   ├── GrafAlgoritamDajkstra.cs
│   │   ├── GrafAlgoritamKruskal.cs
│   │   ├── GrafAlgoritamPrim.cs
│   │   ├── GrafAlgoritamBelmanFord.cs
│   │   └── GrafAlgoritamPovezan.cs
│   └── Obrada/
│       ├── ListaSusedstva.cs
│       └── MatricaPovezanosti.cs
├── Services/
│   └── GraphStateService.cs
├── Grafovi.csproj          # Projektni fajl
└── Grafovi.sln             # Solution fajl
```


## Implementirani algoritmi

### 1. Provera povezanosti grafa
Koristi DFS (Depth-First Search) za pronalaženje svih komponenti povezanosti u grafu.
- **Klasa:** `GrafAlgoritamPovezan.cs`
- **Rezultat:** Lista grupa čvorova koji su međusobno povezani

### 2. Dajkstrin algoritam (Dijkstra)
Pronalazi najkraće puteve od početnog čvora do svih ostalih čvorova u grafu sa nenegativnim težinama.
- **Klasa:** `GrafAlgoritamDajkstra.cs`
- **Rezultat:** Najkraće udaljenosti i putevi do svih čvorova
- **Napomena:** Radi samo sa nenegativnim težinama

### 3. Kruskalov algoritam (Kruskal)
Pronalazi minimalno razapinjuće stablo za težinski graf.
- **Klasa:** `GrafAlgoritamKruskal.cs`
- **Rezultat:** Minimalno razapinjuće stablo sa ukupnom težinom
- **Pristup:** Union-Find

### 4. Primov algoritam (Prim)
Alternativni algoritam za pronalaženje minimalnog razapinjućeg stabla.
- **Klasa:** `GrafAlgoritamPrim.cs`
- **Rezultat:** Minimalno razapinjuće stablo sa ukupnom težinom
- **Pristup:** Greedy algoritam koji raste iz jednog čvora

### 5. Belman-Fordov algoritam (Bellman-Ford)
Pronalazi najkraće puteve od početnog čvora sa mogućnošću detektovanja negativnih ciklusa.
- **Klasa:** `GrafAlgoritamBelmanFord.cs`
- **Rezultat:** Najkraće puteve ili detekcija negativnog ciklusa
- **Prednost:** Može raditi sa negativnim težinama i detektovati negativne cikluse


## Važne C# klase

#### `Graf.cs`
Glavna klasa koja predstavlja strukturu grafa.
```csharp
public class Graf
{
    public List<GrafCvor> cvorovi { get; set; }
    public List<GrafGrana> grane { get; set; }
    public bool usmeren { get; set; }
    public bool tezinski { get; set; }
    
    // Metode:
    void Dodaj(string pocetniNaziv, string krajnjiNaziv, double tezina, bool usmerenGraf)
    void ObrisiCvor(GrafCvor cvor)
    void ObrisiGranu(GrafGrana grana)
}
```

#### `GrafCvor.cs`
Predstavlja čvor u grafu.
```csharp
public class GrafCvor
{
    public int ID { get; set; }
    public string naziv { get; set; }
}
```

#### `GrafGrana.cs`
Predstavlja granu između dva čvora.
```csharp
public class GrafGrana
{
    public GrafCvor pocetniCvor { get; set; }
    public GrafCvor krajnjiCvor { get; set; }
    public double tezina { get; set; }
}
```

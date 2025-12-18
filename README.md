# Grafovi
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Netlify Status](https://img.shields.io/netlify/01f9121c-f21a-41d1-92a1-465eee06aff4?style=flat-square&label=Netlify&logo=netlify)](https://grafovi.netlify.app/)

C#/JavaScript projekat za vizualizaciju i algoritme nad grafovima.


## Sadržaj
- [Osobine](#osobine)
- [Uputstvo za instalaciju i podešavanje](#uputstvo-za-instalaciju-i-podešavanje)
- [Struktura projekta](#struktura-projekta)
- [Važne C# klase](#važne-c-klase)


## Osobine
*   **Vizualizacija grafova**
*   **Implementacija algoritama**
*   **Mogućnost čuvanja i učitavanja podataka** u JSON formatu.


## Uputstvo za instalaciju i podešavanje

1.  **Klonirajte repozitorijum:**

    ```
    git clone https://github.com/th3akii/Grafovi.git
    cd Grafovi
    ```

2.  **Povucite zavisnosti (Restore):**

    ```
    dotnet restore
    ```

3.  **Izgradite projekat (Build):**

    ```
    dotnet build
    ```

4.  **Pokrenite projekat:**

    ```
    dotnet run --project Grafovi
    ```

    Ovo će pokrenuti Blazor aplikaciju. U konzoli će se ispisati URL adresa preko koje možete pristupiti aplikaciji u veb pregledaču (obično `http://localhost:5000` ili slično).


## Struktura projekta
```
Grafovi/
├── wwwroot/
│   ├── app.js         # JS fajl za iscrtavanje grafova i interakcije
│   ├── app.css        # CSS stilovi (koji se ne koriste nigde)
│   ├── graph.css      # CCSS stilovi za vizualizaciju grafa
│   └── index.html     # Main HTML file (if exists)
├── Components/
│   ├── ...            # Blazor komponente
├── Models/
│   ├── ...            # C# modeli za graf
├── Properties/
│   └── launchSettings.json # Konfiguracija za pokretanje aplikacije
├── appsettings.json # Podešavanja aplikacije
├── Grafovi.csproj   # Fajl projekta
├── Grafovi.sln      # Solution fajl
└── README.md
```


## Važne C# klase
* **`Graf.cs`:** Strukturu podataka grafa.
    * `AddCvor(GrafCvor cvor)`: Dodaje čvor u graf.
    *   `AddGrana(GrafCvor pocetni, GrafCvor krajnji, int tezina)`: Dodaje granu između dva čvora sa određenom težinom.
    *   `UkloniCvor(GrafCvor cvor)`: Uklanja čvor iz grafa i sve grane povezane sa njim.
    *   `UkloniGranu(GrafCvor pocetni, GrafCvor krajnji)`: Uklanja granu između dva čvora.

*   **`GrafCvor.cs`:** Čvor u grafu.
    *   `Id`: Jedinstvena vrednost za svaki čvor.

*   **`GrafAlgoritamDajkstra.cs`:** Dajkstrin algoritam za pronalaženje najkraćeg puta između dva čvora.
    *   `IzracunajNajkraciPut(Graf graf, GrafCvor pocetni, GrafCvor krajnji)`: Računa najkraći put od početnog do krajnjeg čvora.

*   **`GrafAlgoritamPovezan.cs`:** Algoritam za proveru povezanosti grafa.
    *   `JePovezan(Graf graf)`: Proverava da li je graf povezan.

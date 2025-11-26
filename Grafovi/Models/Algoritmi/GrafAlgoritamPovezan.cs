using Grafovi.Models;
using Grafovi.Models.Obrada;

namespace Grafovi.Models.Algoritmi
{
    public class RezultatPovezanosti
    {
        public bool jePovezan { get; set; }
        public List<List<GrafCvor>> cvoroviUGrupi { get; set; } = new List<List<GrafCvor>>();
        public int brojGrupa { get; set; }
    }


    public static class GrafAlgoritamPovezan
    {
        public static RezultatPovezanosti DaLiJePovezanLista(Graf graf)
        {
            var rezultat = new RezultatPovezanosti();
            if (graf.cvorovi.Count == 0)
            {
                rezultat.jePovezan = true;
                return rezultat;
            }

            var poseceni = new Dictionary<int, int>();
            foreach (var cvor in graf.cvorovi)
            {
                poseceni[cvor.ID] = 0;
            }

            var listaSusedstva = ListaSusedstva.KreirajIzGrafa(graf);
            int brGrupe = 0;

            foreach (var cvor in graf.cvorovi)
            {
                if (poseceni[cvor.ID] == 0)
                {
                    brGrupe++;
                    var trenutnaGrupa = new List<GrafCvor>();
                    rezultat.cvoroviUGrupi.Add(trenutnaGrupa);

                    var stek = new Stack<GrafCvor>();
                    stek.Push(cvor);
                    poseceni[cvor.ID] = brGrupe;
                    trenutnaGrupa.Add(cvor);

                    while (stek.Count > 0)
                    {
                        var trenutni = stek.Pop();
                        var susedi = listaSusedstva.GetSusedneCvorove(trenutni);

                        foreach (var sused in susedi)
                        {
                            if (poseceni.ContainsKey(sused.ID) && poseceni[sused.ID] == 0)
                            {
                                poseceni[sused.ID] = brGrupe;
                                trenutnaGrupa.Add(sused);
                                stek.Push(sused);
                            }
                        }
                    }
                }
            }

            rezultat.brojGrupa = brGrupe;
            rezultat.jePovezan = brGrupe == 1;
            return rezultat;
        }

        public static RezultatPovezanosti DaLiJePovezanMatrica(Graf graf)
        {
            var rezultat = new RezultatPovezanosti();
            if (graf.cvorovi.Count == 0)
            {
                rezultat.jePovezan = true;
                return rezultat;
            }

            var poseceni = new Dictionary<int, int>();
            foreach (var cvor in graf.cvorovi)
            {
                poseceni[cvor.ID] = 0;
            }

            var matricaPovezanosti = MatricaPovezanosti.KreirajIzGrafa(graf);
            int brGrupe = 0;

            foreach (var cvor in graf.cvorovi)
            {
                if (poseceni[cvor.ID] == 0)
                {
                    brGrupe++;
                    var trenutnaGrupa = new List<GrafCvor>();
                    rezultat.cvoroviUGrupi.Add(trenutnaGrupa);

                    var stek = new Stack<GrafCvor>();
                    stek.Push(cvor);
                    poseceni[cvor.ID] = brGrupe;
                    trenutnaGrupa.Add(cvor);

                    while (stek.Count > 0)
                    {
                        var trenutni = stek.Pop();
                        
                        foreach (var susedniCvor in graf.cvorovi)
                        {
                            if (matricaPovezanosti.PostojiGrana(trenutni, susedniCvor) && 
                                poseceni.ContainsKey(susedniCvor.ID) && 
                                poseceni[susedniCvor.ID] == 0)
                            {
                                poseceni[susedniCvor.ID] = brGrupe;
                                trenutnaGrupa.Add(susedniCvor);
                                stek.Push(susedniCvor);
                            }
                        }
                    }
                }
            }

            rezultat.brojGrupa = brGrupe;
            rezultat.jePovezan = brGrupe == 1;
            return rezultat;
        }
    }
}
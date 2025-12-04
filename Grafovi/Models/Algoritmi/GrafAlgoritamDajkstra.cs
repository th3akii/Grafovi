using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;
using Grafovi.Models.Obrada;

namespace Grafovi.Models.Algoritmi
{
    public class DajkstraRezultat
    {
        public string cvor { get; set; } = "";
        public string put { get; set; }
        public double udaljenost { get; set; }
    }
    
    public class GrafAlgoritamDajkstra
    {
        private Dictionary<int, int> obradjeni = new Dictionary<int, int>();
        private Dictionary<int, double> distanca = new Dictionary<int, double>();
        private Dictionary<int, string> put = new Dictionary<int, string>();

        public List<DajkstraRezultat> DajkstraLista(Graf graf, GrafCvor pocetniCvor)
        {
            List<DajkstraRezultat> rezultati = new List<DajkstraRezultat>();
            obradjeni = new Dictionary<int, int>();
            distanca = new Dictionary<int, double>();
            put = new Dictionary<int, string>();
            var listaSusedstva = ListaSusedstva.KreirajIzGrafa(graf);
            var red = new PriorityQueue<GrafCvor, double>();

            foreach (var cvor in graf.cvorovi)
            {
                distanca[cvor.ID] = double.MaxValue;
                obradjeni[cvor.ID] = 0;
                put[cvor.ID] = "";
            }
            
            distanca[pocetniCvor.ID] = 0;
            put[pocetniCvor.ID] = pocetniCvor.naziv;
            red.Enqueue(pocetniCvor, 0);

            while (red.Count > 0)                
            {
                var cvor = red.Dequeue();
                if (obradjeni[cvor.ID] == 1)
                    continue;
                obradjeni[cvor.ID] = 1;

                var susedniCvorovi = listaSusedstva.GetSusedneCvorove(cvor);
                foreach (var sused in susedniCvorovi)
                {
                    if(obradjeni[sused.cvor.ID] == 0)
                    {
                        double novaDistanca = distanca[cvor.ID] + sused.tezina;
                        if (novaDistanca < distanca[sused.cvor.ID])
                        {
                            distanca[sused.cvor.ID] = novaDistanca;
                            put[sused.cvor.ID] = put[cvor.ID] + " -> " + sused.cvor.naziv;
                            red.Enqueue(sused.cvor, novaDistanca);
                        }
                    }
                }
            }

            foreach (var cvor in graf.cvorovi)
            {
                if (cvor.ID != pocetniCvor.ID)
                {
                    rezultati.Add(new DajkstraRezultat
                    {
                        cvor = cvor.naziv,
                        put = put[cvor.ID],
                        udaljenost = distanca[cvor.ID]
                    });
                }
            }

            return rezultati;
        }

        public List<DajkstraRezultat> DajkstraMatrica(Graf graf, GrafCvor pocetniCvor)
        {
            List<DajkstraRezultat> rezultati = new List<DajkstraRezultat>();
            obradjeni = new Dictionary<int, int>();
            distanca = new Dictionary<int, double>();
            put = new Dictionary<int, string>();
            var matricaSusedstva = MatricaPovezanosti.KreirajIzGrafa(graf);

            foreach (var cvor in graf.cvorovi)
            {
                distanca[cvor.ID] = double.MaxValue;
                obradjeni[cvor.ID] = 0;
                put[cvor.ID] = "";
            }

            distanca[pocetniCvor.ID] = 0;
            put[pocetniCvor.ID] = pocetniCvor.naziv;

            foreach (var cvor in graf.cvorovi)
            {
                var susedniCvorovi = matricaSusedstva.GetSusedneCvorove(graf, cvor);
                foreach (var sused in susedniCvorovi)
                {
                    if (obradjeni[sused.cvor.ID] == 0)
                    {
                        double novaDistanca = distanca[cvor.ID] + sused.tezina;
                        if (novaDistanca < distanca[sused.cvor.ID])
                        {
                            distanca[sused.cvor.ID] = novaDistanca;
                            put[sused.cvor.ID] = put[cvor.ID] + " -> " + sused.cvor.naziv;
                        }
                    }
                }
                obradjeni[cvor.ID] = 1;
            }

            foreach (var cvor in graf.cvorovi)
            {
                if (cvor.ID != pocetniCvor.ID)
                {
                    rezultati.Add(new DajkstraRezultat
                    {
                        cvor = cvor.naziv,
                        put = put[cvor.ID],
                        udaljenost = distanca[cvor.ID]
                    });
                }
            }

            return rezultati;
        }
    }
}
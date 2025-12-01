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
        public List<string> put { get; set; } = new List<string>();
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

            foreach (var cvor in graf.cvorovi)
            {
                distanca[cvor.ID] = double.MaxValue;
                obradjeni[cvor.ID] = 0;
                put[cvor.ID] = ""; // Prazan put na početku
            }
            
            distanca[pocetniCvor.ID] = 0;
            put[pocetniCvor.ID] = pocetniCvor.naziv; // Put do početnog čvora je samo on sam

            for (int i = 1; i < graf.cvorovi.Count; i++)
            {
                distanca[graf.cvorovi[i].ID] = double.MaxValue;
                obradjeni[graf.cvorovi[i].ID] = 0;
            }

            foreach (var cvor in graf.cvorovi)
            {
                var susedniCvorovi = listaSusedstva.GetSusedneCvorove(cvor);
                foreach (var sused in susedniCvorovi)
                {
                    if(obradjeni[sused.cvor.ID] == 0)
                    {
                        if (distanca[sused.cvor.ID] <= distanca[cvor.ID] + sused.tezina)
                        {
                            distanca[sused.cvor.ID] = distanca[sused.cvor.ID];
                        }
                        else
                        {
                            distanca[sused.cvor.ID] = distanca[cvor.ID] + sused.tezina;
                            put[sused.cvor.ID] = put[cvor.ID] + sused.cvor.naziv;
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
                        put = new List<string> { put[cvor.ID] },
                        udaljenost = distanca[cvor.ID]
                    });
                }
            }

            return rezultati;
        }

        public string GetDistanceString()
        {
            if (distanca == null)
            {
                return string.Empty;
            }

            var sb = new System.Text.StringBuilder();
            foreach (var d in distanca)
            {
                sb.AppendLine($"Cvor ID: {d.Key} Distanca: {d.Value}");
            }

            return sb.ToString();
        }
    }
}
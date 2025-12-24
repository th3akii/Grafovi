using System.ComponentModel;
using Grafovi.Models.Obrada;

namespace Grafovi.Models.Algoritmi
{
    public class BelmanFordRezultat
    {
        public string cvor { get; set; } = "";
        public string put { get; set; }
        public double udaljenost { get; set; }
    }
    
    public class GrafAlgoritamBelmanFord
    {
        private Dictionary<int, double> distanca = new Dictionary<int, double>();
        private Dictionary<int, string> put = new Dictionary<int, string>();

        public List<BelmanFordRezultat> BelmanFordLista(Graf graf, GrafCvor pocetniCvor)
        {
            List<BelmanFordRezultat> rezultati = new List<BelmanFordRezultat>();
            bool menjano = false;

            foreach (var cvor in graf.cvorovi)
            {
                distanca[cvor.ID] = double.MaxValue;
                put[cvor.ID] = "";
            }

            distanca[pocetniCvor.ID] = 0;
            put[pocetniCvor.ID] = pocetniCvor.naziv;

            for (int i = 0; i < graf.cvorovi.Count()-1; i++)
            {
                menjano = false;
                foreach(var g in graf.grane)
                {
                    int cvor1 = g.pocetniCvor.ID;
                    int cvor2 = g.krajnjiCvor.ID;
                    double tezina = g.tezina;

                    if (distanca[cvor1] != double.MaxValue && distanca[cvor1] + tezina < distanca[cvor2])
                    {
                        distanca[cvor2] = distanca[cvor1] + tezina;
                        put[cvor2] = put[cvor1] + " -> " + g.krajnjiCvor.naziv;
                        menjano = true;
                    }
                    
                    if (!graf.usmeren)
                    {
                        if (distanca[cvor2] != double.MaxValue && distanca[cvor2] + tezina < distanca[cvor1])
                        {
                            distanca[cvor1] = distanca[cvor2] + tezina;
                            put[cvor1] = put[cvor2] + " -> " + g.pocetniCvor.naziv;
                        }
                    }

                }
            }

            foreach (var g in graf.grane)
            {
                int cvor1 = g.pocetniCvor.ID;
                int cvor2 = g.krajnjiCvor.ID;
                double tezina = g.tezina;

                if (distanca[cvor1] != double.MaxValue && distanca[cvor1] + tezina < distanca[cvor2])
                {
                    return null;
                }
                
                if (!graf.usmeren)
                {
                    if (distanca[cvor2] != double.MaxValue && distanca[cvor2] + tezina < distanca[cvor1])
                    {
                        return null;
                    }
                }
            }

            foreach (var cvor in graf.cvorovi)
            {
                if (cvor.ID != pocetniCvor.ID)
                {
                    rezultati.Add(new BelmanFordRezultat
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
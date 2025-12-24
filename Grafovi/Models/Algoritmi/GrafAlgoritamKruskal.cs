using System.Collections.Generic;
using System.Linq;
using Grafovi.Models;
using Grafovi.Models.Obrada;

namespace Grafovi.Models.Algoritmi
{
    public class KruskalRezultat
    {
        public List<GrafGrana> graneZaBrisanje { get; set; } = new List<GrafGrana>();
        public double ukupnaTezina { get; set; }
    }

    public class GrafAlgoritamKruskal
    {
        public KruskalRezultat KruskalAlgoritam(Graf graf)
        {
            List<GrafGrana> sveGrane = new List<GrafGrana>(graf.grane);
            sveGrane.Sort((a, b) => a.tezina.CompareTo(b.tezina));

            UnionFind unionFind = new UnionFind(graf);
            List<GrafGrana> graneZaBrisanje = new List<GrafGrana>();
            double ukupnaTezina = 0;

            foreach (var grana in sveGrane)
            {
                int korenCvor1 = unionFind.Nadji(grana.pocetniCvor.ID);
                int korenCvor2 = unionFind.Nadji(grana.krajnjiCvor.ID);

                if (korenCvor1 != korenCvor2)
                {
                    unionFind.Spoji(korenCvor1, korenCvor2);
                    ukupnaTezina += grana.tezina;
                }
                else
                {
                    graneZaBrisanje.Add(grana);
                }
            }

            return new KruskalRezultat
            {
                graneZaBrisanje = graneZaBrisanje,
                ukupnaTezina = ukupnaTezina
            };
        }
    }

    class UnionFind
    {
        private Dictionary<int, int> roditelj;
        private Dictionary<int, int> rank;

        public UnionFind(Graf graf)
        {
            roditelj = new Dictionary<int, int>();
            rank = new Dictionary<int, int>();

            foreach (var cvor in graf.cvorovi)
            {
                roditelj[cvor.ID] = cvor.ID;
                rank[cvor.ID] = 0;
            }
        }

        public int Nadji(int id)
        {
            if (roditelj[id] != id)
            {
                roditelj[id] = Nadji(roditelj[id]);
            }

            return roditelj[id];
        }

        public void Spoji(int i, int j)
        {
            int korenI = Nadji(i);
            int korenJ = Nadji(j);

            if (korenI == korenJ)
            {
                return;
            }

            if (rank[korenI] < rank[korenJ])
            {
                roditelj[korenI] = korenJ;
            }
            else if (rank[korenI] > rank[korenJ])
            {
                roditelj[korenJ] = korenI;
            }
            else
            {
                roditelj[korenJ] = korenI;
                rank[korenI]++;
            }
        }
    }
}
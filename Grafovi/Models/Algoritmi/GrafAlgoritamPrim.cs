using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.JSInterop;
using Grafovi.Models.Obrada;

namespace Grafovi.Models.Algoritmi
{
    public class PrimRezultat
    {
        public List<GrafGrana> graneZaBrisanje { get; set; } = new List<GrafGrana>();
        public double ukupnaTezina { get; set; }
    }

    public class GrafAlgoritamPrim
    {
        public PrimRezultat PrimovAlgoritam(Graf graf)
        {
            HashSet<int> obradjeniCvorovi = new HashSet<int>();
            List<GrafGrana> graneZaBrisanje = new List<GrafGrana>();
            PriorityQueue<GrafGrana, double> red = new PriorityQueue<GrafGrana, double>();

            GrafCvor pocetniCvor = graf.cvorovi[0];
            obradjeniCvorovi.Add(pocetniCvor.ID);
            
            foreach (var grana in graf.grane)
            {
                if (grana.pocetniCvor.ID == pocetniCvor.ID || grana.krajnjiCvor.ID == pocetniCvor.ID)
                {
                    red.Enqueue(grana, grana.tezina);
                }
            }

            List<GrafGrana> iskorisceneGrane = new List<GrafGrana>();

            while (red.Count > 0)
            {
                GrafGrana trenutnaGrana = red.Dequeue();

                bool pocetniObradjen = obradjeniCvorovi.Contains(trenutnaGrana.pocetniCvor.ID);
                bool krajnjiObradjen = obradjeniCvorovi.Contains(trenutnaGrana.krajnjiCvor.ID);

                if (pocetniObradjen != krajnjiObradjen)
                {
                    iskorisceneGrane.Add(trenutnaGrana);

                    GrafCvor noviCvor = pocetniObradjen ? trenutnaGrana.krajnjiCvor : trenutnaGrana.pocetniCvor;
                    obradjeniCvorovi.Add(noviCvor.ID);

                    foreach (var grana in graf.grane)
                    {
                        if ((grana.pocetniCvor.ID == noviCvor.ID || grana.krajnjiCvor.ID == noviCvor.ID)
                            && !iskorisceneGrane.Contains(grana))
                        {
                            red.Enqueue(grana, grana.tezina);
                        }
                    }
                }
            }

            double ukupnaTezina = 0;
            foreach (var grana in iskorisceneGrane)
            {
                ukupnaTezina += grana.tezina;
            }

            foreach (var grana in graf.grane)
            {
                if (!iskorisceneGrane.Contains(grana))
                {
                    graneZaBrisanje.Add(grana);
                }
            }

            return new PrimRezultat
            {
                graneZaBrisanje = graneZaBrisanje,
                ukupnaTezina = ukupnaTezina
            };
        }

    }
}
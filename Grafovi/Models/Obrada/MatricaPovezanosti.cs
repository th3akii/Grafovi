namespace Grafovi.Models.Obrada
{
    public class MatricaPovezanosti
    {
        public double[,] matrica { get; set; }
        public bool usmeren { get; set; }
        public bool tezinski { get; set; }
        public int brojCvorova;

        public MatricaPovezanosti(Graf graf)
        {
            usmeren = graf.usmeren;
            tezinski = graf.tezinski;
            brojCvorova = graf.cvorovi.Count;
            matrica = new double[brojCvorova, brojCvorova];

            for (int i = 0; i < brojCvorova; i++)
            {
                for (int j = 0; j < brojCvorova; j++)
                {
                    matrica[i, j] = 0;
                }
            }
        }

        public static MatricaPovezanosti KreirajIzGrafa(Graf graf)
        {
            var matricaPovezanosti = new MatricaPovezanosti(graf);

            for (int i = 0; i < graf.cvorovi.Count; i++)
            {
                var cvorA = graf.cvorovi[i];
                for (int j = 0; j < graf.cvorovi.Count; j++)
                {
                    var cvorB = graf.cvorovi[j];
                    var grana = graf.grane.FirstOrDefault(g =>
                        g.pocetniCvor == cvorA && g.krajnjiCvor == cvorB ||
                        (!graf.usmeren && g.pocetniCvor == cvorB && g.krajnjiCvor == cvorA)
                    );

                    if (grana != null)
                    {
                        matricaPovezanosti.matrica[i, j] = grana.tezina;
                    }
                }
            }

            return matricaPovezanosti;
        }

        public bool PostojiGrana(Graf graf, GrafCvor izCvor, GrafCvor uCvor)
        {
            int i = graf.cvorovi.IndexOf(izCvor);
            int j = graf.cvorovi.IndexOf(uCvor);

            return matrica[i, j] != 0;
        }

        public double GetTezinaGrane(Graf graf, GrafCvor izCvor, GrafCvor uCvor)
        {
            int i = graf.cvorovi.IndexOf(izCvor);
            int j = graf.cvorovi.IndexOf(uCvor);

            return matrica[i, j];
        }

        public List<Sused> GetSusedneCvorove(Graf graf, GrafCvor cvor)
        {
            var susedniCvorovi = new List<Sused>();
            int i = graf.cvorovi.IndexOf(cvor);
            
            if (i == -1) return susedniCvorovi;

            for (int j = 0; j < brojCvorova; j++)
            {
                if (matrica[i, j] != 0)
                {
                    var susedCvor = graf.cvorovi[j];
                    susedniCvorovi.Add(new Sused(susedCvor, matrica[i, j]));
                }
            }

            return susedniCvorovi;
        }
    }
}
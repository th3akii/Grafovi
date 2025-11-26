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

        public bool PostojiGrana(GrafCvor izCvor, GrafCvor uCvor)
        {
            int i = izCvor.ID;
            int j = uCvor.ID;

            return matrica[i, j] != 0;
        }

        public double GetTezinaGrane(GrafCvor izCvor, GrafCvor uCvor)
        {
            int i = izCvor.ID;
            int j = uCvor.ID;

            return matrica[i, j];
        }
    }
}
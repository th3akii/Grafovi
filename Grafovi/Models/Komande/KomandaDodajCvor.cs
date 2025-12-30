namespace Grafovi.Models.Komande
{
    public class KomandaDodajCvor : IKomanda
    {
        private string nazivCvora;
        private int cvorID;

        public KomandaDodajCvor(string nazivCvora)
        {
            this.nazivCvora = nazivCvora;
        }

        public void Izvrsi(Graf graf)
        {
            graf.DodajJedanCvor(nazivCvora);
            var noviCvor = graf.cvorovi.FirstOrDefault(c => c.naziv == nazivCvora);
            if (noviCvor != null)
            {
                cvorID = noviCvor.ID;
            }
        }

        public void Ponisti(Graf graf)
        {
            var cvor = graf.cvorovi.FirstOrDefault(c => c.ID == cvorID);
            if (cvor != null)
            {
                graf.ObrisiCvor(cvor);
            }
        }
    }
}
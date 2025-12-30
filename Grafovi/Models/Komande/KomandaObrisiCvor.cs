namespace Grafovi.Models.Komande
{
    public class KomandaObrisiCvor : IKomanda
    {
        private int cvorID;
        private GrafCvor? obrisanCvor;
        private List<GrafGrana> povezaneGrane = new List<GrafGrana>();

        public KomandaObrisiCvor(int cvorID)
        {
            this.cvorID = cvorID;
        }

        public void Izvrsi(Graf graf)
        {
            obrisanCvor = graf.cvorovi.FirstOrDefault(c => c.ID == cvorID);
            if (obrisanCvor != null)
            {
                povezaneGrane = graf.grane
                    .Where(g => g.pocetniCvor.ID == cvorID || g.krajnjiCvor.ID == cvorID)
                    .ToList();
                
                graf.ObrisiCvor(obrisanCvor);
            }
        }

        public void Ponisti(Graf graf)
        {
            if (obrisanCvor != null)
            {
                graf.cvorovi.Add(obrisanCvor);
                foreach (var grana in povezaneGrane)
                {
                    graf.grane.Add(grana);
                }
            }
        }
    }
}
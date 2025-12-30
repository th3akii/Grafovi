namespace Grafovi.Models.Komande
{
    public class KomandaPromeniTezinu : IKomanda
    {
        private string granaID;
        private double novaTezina;
        private double staraTezina;

        public KomandaPromeniTezinu(string granaID, double novaTezina)
        {
            this.granaID = granaID;
            this.novaTezina = novaTezina;
        }

        public void Izvrsi(Graf graf)
        {
            var grana = graf.grane.FirstOrDefault(g => g.ID == granaID);
            if (grana != null)
            {
                staraTezina = grana.tezina;
                grana.tezina = novaTezina;
            }
        }

        public void Ponisti(Graf graf)
        {
            var grana = graf.grane.FirstOrDefault(g => g.ID == granaID);
            if (grana != null)
            {
                grana.tezina = staraTezina;
            }
        }
    }
}
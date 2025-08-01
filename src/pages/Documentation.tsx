import React from "react";

const DocumentationPage: React.FC = () => (
  <main className="max-w-3xl mx-auto px-4 py-8 text-gray-800">
    <h1 className="text-4xl font-bold mb-6 text-blue-700">Angka Tebak Crypto Game Documentation</h1>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Overview</h2>
      <p>
        Angka Tebak Crypto Game adalah aplikasi terdesentralisasi (dApp) berbasis Ethereum yang memungkinkan pengguna untuk bermain tebak angka dengan taruhan kripto. Setiap pemain dapat berpartisipasi dengan mengirimkan sejumlah ETH, lalu menebak angka yang benar dari tiga angka acak yang dihasilkan oleh smart contract. Semua proses game, pembayaran, dan pencatatan hasil dilakukan secara otomatis dan transparan melalui smart contract.
      </p>
      <p className="mt-2">
        Aplikasi ini dirancang untuk memberikan pengalaman bermain yang adil, transparan, dan aman, serta mendukung integrasi dengan kontrak statistik untuk pencatatan riwayat permainan.
      </p>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Features</h2>
      <ul className="list-disc ml-6">
        <li><strong>Random Number Generation:</strong> Setiap sesi permainan menghasilkan 3 angka unik antara 1 hingga 10 menggunakan algoritma acak berbasis keccak256 dan variabel blockchain (timestamp, prevrandao, dsb) untuk memastikan keacakan dan fairness.</li>
        <li><strong>Betting System:</strong> Pemain dapat memasang taruhan dengan nominal tetap (0.01, 0.05, 0.1, 0.25, 0.5, atau 1 ETH). Validasi dilakukan di smart contract untuk mencegah taruhan di luar nominal yang diizinkan.</li>
        <li><strong>Win/Lose Logic:</strong> Jika tebakan pemain sesuai dengan angka yang benar, pemain akan menerima payout 2x dari nilai taruhan. Jika salah, taruhan hangus.</li>
        <li><strong>Game History & Stats:</strong> Setiap hasil permainan dapat dicatat ke kontrak statistik eksternal untuk keperluan leaderboard dan riwayat permainan.</li>
        <li><strong>Owner Controls:</strong> Pemilik kontrak dapat menarik dana dan mengatur alamat kontrak statistik.</li>
        <li><strong>Security:</strong> Perlindungan reentrancy, validasi input, dan pembatasan akses fungsi sensitif.</li>
      </ul>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Smart Contract Structure</h2>
      <h3 className="text-xl font-bold mt-4 mb-2">Main Contract: NumberGuess</h3>
      <ul className="list-disc ml-6 mb-2">
        <li><strong>State Variables:</strong> <br />
          <ul className="list-disc ml-6">
            <li><code>owner</code>: Alamat pemilik kontrak, hanya owner yang dapat melakukan aksi administratif.</li>
            <li><code>gameStatsContract</code>: Alamat kontrak statistik untuk pencatatan hasil game.</li>
            <li><code>gameStates</code>: Mapping yang menyimpan status game setiap pemain (angka, status aktif, timestamp).</li>
          </ul>
        </li>
        <li><strong>Events:</strong> <br />
          <ul className="list-disc ml-6">
            <li><code>GuessResult</code>: Emit setiap kali pemain melakukan tebakan, berisi detail hasil.</li>
            <li><code>NumbersGenerated</code>: Emit setiap kali angka acak dihasilkan.</li>
          </ul>
        </li>
        <li><strong>Modifiers:</strong> <br />
          <ul className="list-disc ml-6">
            <li><code>noReentrancy</code>: Mencegah serangan reentrancy pada fungsi pembayaran.</li>
            <li><code>onlyOwner</code>: Membatasi akses fungsi tertentu hanya untuk owner.</li>
          </ul>
        </li>
      </ul>
      <h4 className="text-lg font-semibold mb-1">Key Functions</h4>
      <ul className="list-disc ml-6">
        <li><code>generateNumbers()</code>: Menghasilkan 3 angka unik, menyimpan ke state pemain, dan emit event.</li>
        <li><code>guessNumber(_guess)</code>: Menerima tebakan, validasi, hitung payout, transfer ETH jika menang, reset status game, dan emit event.</li>
        <li><code>withdrawFunds(amount)</code>: Owner dapat menarik saldo kontrak sesuai jumlah yang tersedia.</li>
        <li><code>getCurrentGameNumbers()</code>: Mengembalikan angka dan status aktif game untuk pemain.</li>
        <li><code>hasActiveGame()</code>: Mengecek apakah pemain memiliki game yang masih aktif.</li>
        <li><code>getContractBalance()</code>: Mengembalikan saldo ETH di kontrak.</li>
        <li><code>setStatsContract(_statsContract)</code>: Mengatur alamat kontrak statistik.</li>
        <li><code>recordToStats(...)</code>: Mencatat hasil game ke kontrak statistik (dipanggil internal).</li>
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Integrasi Backend:</strong> Semua logika game dan pembayaran dilakukan di smart contract, frontend hanya sebagai interface dan trigger transaksi. Data riwayat dan leaderboard diambil dari kontrak statistik.
      </div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Frontend Structure</h2>
      <ul className="list-disc ml-6">
        <li><strong>Framework:</strong> Dibangun dengan React dan TypeScript untuk performa dan maintainability.</li>
        <li><strong>Styling:</strong> Menggunakan Tailwind CSS untuk tampilan modern dan responsif.</li>
        <li><strong>Komponen Utama:</strong>
          <ul className="list-disc ml-6">
            <li><code>GameInterface</code>: UI utama untuk interaksi game (generate, bet, guess).</li>
            <li><code>BetInput</code>: Input nominal taruhan, validasi sebelum transaksi.</li>
            <li><code>GameCard</code>: Menampilkan angka acak yang dihasilkan.</li>
            <li><code>WinningModal</code> / <code>LosingModal</code>: Modal hasil game (menang/kalah).</li>
            <li><code>Leaderboard</code>, <code>History</code>: Statistik dan riwayat permainan, data diambil dari kontrak statistik.</li>
            <li><code>ContractDebugInfo</code>, <code>TransactionStatus</code>: Debug dan status transaksi blockchain.</li>
          </ul>
        </li>
        <li><strong>Integrasi Web3:</strong> Frontend terhubung ke smart contract via library web3/ethers, semua transaksi dilakukan langsung ke blockchain.</li>
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Alur Kerja:</strong> Pengguna melakukan aksi di UI, frontend memvalidasi input, lalu mengirim transaksi ke smart contract. Hasil game dan payout langsung diproses di blockchain.
      </div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">How to Play</h2>
      <ol className="list-decimal ml-6">
        <li><strong>Connect Wallet:</strong> Hubungkan wallet (Metamask, dsb) ke aplikasi. Pastikan jaringan sesuai dengan kontrak yang dideploy.</li>
        <li><strong>Start Game:</strong> Klik tombol untuk generate angka acak. Angka akan muncul di UI dan tersimpan di smart contract.</li>
        <li><strong>Place Bet:</strong> Masukkan nominal taruhan sesuai pilihan yang tersedia. Validasi dilakukan sebelum transaksi dikirim.</li>
        <li><strong>Guess Number:</strong> Pilih salah satu angka yang muncul sebagai tebakan. Transaksi akan dikirim ke smart contract.</li>
        <li><strong>Result:</strong> Jika tebakan benar, payout otomatis dikirim ke wallet. Jika salah, saldo taruhan hangus. Hasil game langsung muncul di UI.</li>
        <li><strong>View History:</strong> Statistik dan riwayat permainan dapat diakses di halaman leaderboard/history, data diambil dari kontrak statistik.</li>
      </ol>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Catatan:</strong> Semua proses game dan pembayaran dilakukan secara on-chain, sehingga transparan dan tidak bisa dimanipulasi.
      </div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Security Considerations</h2>
      <ul className="list-disc ml-6">
        <li><strong>Fund Management:</strong> Semua dana dikelola oleh smart contract, tidak ada pihak ketiga.</li>
        <li><strong>Owner Withdraw:</strong> Hanya owner yang dapat menarik dana dari kontrak.</li>
        <li><strong>Reentrancy Protection:</strong> Fungsi pembayaran dilindungi dari serangan reentrancy.</li>
        <li><strong>Input Validation:</strong> Validasi ketat pada nominal taruhan dan angka tebakan.</li>
        <li><strong>Audit & Transparansi:</strong> Semua kode kontrak dapat diaudit publik, transaksi tercatat di blockchain.</li>
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Risiko:</strong> Pastikan hanya berinteraksi dengan kontrak yang sudah diverifikasi dan hindari phishing. Selalu cek saldo kontrak sebelum bermain.
      </div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Deployment & Configuration</h2>
      <ul className="list-disc ml-6">
        <li><strong>Deploy Smart Contract:</strong> Deploy <code>NumberGuess</code> ke jaringan Ethereum (mainnet/testnet) menggunakan tools seperti Remix, Hardhat, atau Truffle.</li>
        <li><strong>Set Stats Contract:</strong> Setelah deploy, atur alamat kontrak statistik dengan fungsi <code>setStatsContract</code> oleh owner.</li>
        <li><strong>Frontend Configuration:</strong> Update konfigurasi frontend (alamat kontrak, ABI) agar terhubung ke smart contract yang sudah dideploy.</li>
        <li><strong>Testing:</strong> Lakukan pengujian end-to-end untuk memastikan semua fitur berjalan dengan baik.</li>
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Tips:</strong> Gunakan testnet untuk uji coba sebelum deploy ke mainnet. Pastikan saldo kontrak cukup untuk payout.</div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Troubleshooting</h2>
      <ul className="list-disc ml-6">
        <li><strong>Insufficient Balance:</strong> Jika payout gagal, cek saldo kontrak dan pastikan cukup untuk membayar kemenangan.</li>
        <li><strong>Transaction Failed:</strong> Jika transaksi gagal, cek gas limit, status game, dan validasi input.</li>
        <li><strong>Network Issues:</strong> Pastikan jaringan wallet sesuai dengan jaringan kontrak.</li>
        <li><strong>Referensi:</strong> Lihat <code>TRANSACTION_TROUBLESHOOTING.md</code> untuk solusi masalah umum.</li>
      </ul>
      <div className="mt-4 text-sm text-gray-600">
        <strong>Support:</strong> Jika masalah belum teratasi, hubungi owner atau buka issue di repository.</div>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">License</h2>
      <p>MIT License. Kode sumber dapat digunakan, dimodifikasi, dan didistribusikan sesuai ketentuan lisensi MIT.</p>
    </section>
    <section className="mb-8">
      <h2 className="text-2xl font-semibold mb-2">Contact & Support</h2>
      <p>Untuk dukungan, pertanyaan, atau kolaborasi, silakan hubungi owner melalui email yang tertera di repository atau buka issue di GitHub. Saran dan kontribusi sangat terbuka untuk pengembangan aplikasi lebih lanjut.</p>
    </section>
  </main>
);

export default DocumentationPage;

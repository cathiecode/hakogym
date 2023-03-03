export default function Error() {
  return (
    <div>
      ビューがクラッシュしました!
      <button onClick={() => location.reload()}>
        UIを再読み込み(データは保持されます)
      </button>
    </div>
  );
}

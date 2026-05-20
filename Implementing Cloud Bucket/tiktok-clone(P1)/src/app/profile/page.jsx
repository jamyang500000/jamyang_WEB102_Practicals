export default function ProfilePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Profile</h1>
      <div className="bg-gray-100 p-6 rounded-lg">
        <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>
        <h2 className="text-xl font-semibold">Username</h2>
        <p className="text-gray-600">@username</p>
        <div className="mt-4 flex space-x-4">
          <div>
            <span className="font-bold">0</span> Following
          </div>
          <div>
            <span className="font-bold">0</span> Followers
          </div>
          <div>
            <span className="font-bold">0</span> Likes
          </div>
        </div>
      </div>
    </div>
  );
}
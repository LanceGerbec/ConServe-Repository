import { useState, useEffect } from 'react';
import { Target, Eye, Award, Users, BookOpen, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const About = () => {
  const { user } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/team`);
      const data = await res.json();
      setTeamMembers(data.members || []);
    } catch (error) {
      console.error('Failed to fetch team:', error);
    } finally {
      setLoading(false);
    }
  };

  const values = [
    { icon: Shield, title: 'Security', desc: 'Industry-standard encryption' },
    { icon: BookOpen, title: 'Accessibility', desc: 'Easy access for all users' },
    { icon: Award, title: 'Excellence', desc: 'Quality research & integrity' },
    { icon: Users, title: 'Collaboration', desc: 'Community of researchers' }
  ];

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">
          About <span className="text-navy dark:text-blue-400">CONserve</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">Preserving excellence in nursing research</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen className="text-navy dark:text-blue-400" size={24} />
          What is CONserve?
        </h2>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
          CONserve is the official research repository of Nueva Ecija University of Science and Technology (NEUST) College of Nursing. Our platform serves as a comprehensive digital archive for nursing research papers, theses, and academic publications.
        </p>
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          We are committed to preserving, protecting, and promoting academic research excellence by providing a secure, accessible platform that connects researchers, students, and faculty members within the nursing community.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-navy dark:bg-blue-700 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Target size={28} />
            <h2 className="text-xl font-bold">Our Mission</h2>
          </div>
          <p className="leading-relaxed text-sm">
            To preserve, protect, and promote academic research excellence by providing a secure, accessible platform for nursing research papers, fostering collaboration and advancing nursing science.
          </p>
        </div>

        <div className="bg-accent dark:bg-blue-600 text-white rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-3">
            <Eye size={28} />
            <h2 className="text-xl font-bold">Our Vision</h2>
          </div>
          <p className="leading-relaxed text-sm">
            To be the leading research repository in the Philippines, recognized for excellence in preserving and promoting nursing research that contributes to evidence-based practice and improved healthcare outcomes.
          </p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 text-center">Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {values.map((value, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                  <value.icon className="text-blue-600 dark:text-blue-400" size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-1">{value.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{value.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meet Our Team</h2>
          {user?.role === 'admin' && (
            <button onClick={() => window.location.href = '/dashboard?tab=team'} className="px-4 py-2 bg-navy dark:bg-blue-600 text-white rounded-lg hover:bg-navy-800 dark:hover:bg-blue-700 text-sm font-semibold">
              Manage Team
            </button>
          )}
        </div>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy dark:border-blue-500 mx-auto"></div>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">No team members added yet</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 items-start">
            {teamMembers.map((member) => (
              <div key={member._id} className="flex flex-col items-center group h-full">
                <div className="w-20 h-20 sm:w-24 sm:h-24 mb-3 rounded-full overflow-hidden bg-gradient-to-br from-navy to-accent dark:from-blue-600 dark:to-blue-800 group-hover:scale-110 transition shadow-md flex-shrink-0">
                  {member.imageUrl ? (
                    <img src={member.imageUrl} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                  )}
                </div>
                
                <div className="text-center flex flex-col items-center min-h-[70px] sm:min-h-[65px]">
                  <h3 className="font-bold text-gray-900 dark:text-white text-xs sm:text-sm leading-tight mb-0.5 line-clamp-2">
                    {member.name}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-0.5 line-clamp-1">
                    {member.role}
                  </p>
                  <p className="text-[10px] sm:text-xs text-blue-600 dark:text-blue-400 mt-0.5 line-clamp-1">
                    NEUST College of Nursing
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-r from-navy to-accent dark:from-blue-700 dark:to-blue-900 text-white rounded-xl p-6 text-center shadow-lg">
        <h2 className="text-xl font-bold mb-2">Want to Learn More?</h2>
        <p className="mb-4 text-blue-100 dark:text-blue-200 text-sm">Get in touch with us for inquiries or support</p>
        <a href="mailto:conserve2025@gmail.com" className="inline-block bg-white text-navy dark:text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
          Contact Us
        </a>
      </div>
    </div>
  );
};

export default About;
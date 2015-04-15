# This file is part of ChiVO, the Chilean Virtual Observatory
# Copyright (C) 2015 Jonathan Antognini Cavieres <jonathan.antognini@gmail.com>
#                    Cesar Parra Moreno <cparra@csrg.cl>
#                    Constanza Soto <constanza.soto.12@sansano.usm.cl>
#                    Jose Miguel Castro <jcastro@csrg.cl>
#                    Marco Salinas <marco.salinas.12@sansano.usm.cl>
#                    Felipe Morales <felipe.moralesm.12@sansano.usm.cl>
#                    Luis E. Arevalo R. <arevalo@luchox.cl>
# 
# This program is free software; you can redistribute it and/or modify 
# it under the terms of the GNU General Public License as published by 
# the Free Software Foundation; either version 2 of the License, or 
# (at your option) any later version.
# 
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
# 
# You should have received a copy of the GNU General Public License
# along with this program; if not, write to the Free Software
# Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 
# 02110-1301, USA or visit <http://www.gnu.org/licenses/>.


class User < ActiveRecord::Base
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable
end
